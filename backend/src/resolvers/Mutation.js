const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const { hasPermission } = require("../utils");
const stripe = require("../stripe");

const mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You are not logged in");
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );
    return item;
  },

  async updateItem(parent, args, ctx, info) {
    const update = { ...args };
    delete update.id;

    return await ctx.db.mutation.updateItem(
      {
        data: update,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    //1. find the item
    const item = await ctx.db.query.item({ where }, `{id title user { id }}`);
    //2. User permission to delete
    const ownItem = item.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permission.some(permission =>
      ["ADMIN", "ITEMDELETE"].includes(permission)
    );

    if (!ownItem && !hasPermission) {
      throw new error("You don't have the permission to delete");
    }
    //3. Delete item
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signUp(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permission: { set: ["USER"] }
        }
      },
      info
    );
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return user;
  },
  async signIn(parent, { email, password }, ctx, info) {
    const isUser = await ctx.db.query.user({ where: { email } });

    if (!isUser) {
      throw new Error(`No such user found for email ${email}`);
    }
    const isValid = await bcrypt.compare(password, isUser.password);
    if (!isValid) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign({ userId: isUser.id }, process.env.APP_SECRET);
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    return isUser;
  },
  signOut(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "thanks" };
  },
  async requestReset(parent, args, ctx, info) {
    const isUser = await ctx.db.query.user({ where: { email: args.email } });
    if (!isUser) {
      throw new Error(`No Such user found for email ${args.email}`);
    }
    const randomBytesPromisfied = promisify(randomBytes);
    const resetToken = (await randomBytesPromisfied(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;

    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    transport.sendMail({
      from: "rachit4evr@gmail.com",
      to: isUser.email,
      subject: "Reset your password sick fits",
      html: makeANiceEmail(`Your Password Reset token is here!
      \n\n
      <a href="${
        process.env.FRONTEND_URL
      }/reset?resetToken=${resetToken}">Click here to reset</a>
      `)
    });

    return { message: "thanks" };
  },
  async resetPassword(parent, args, ctx, info) {
    // 1.check if password match
    if (args.password !== args.confirmPassword) {
      throw new Error("Password and confirm password not match");
    }
    // 2. check if its legit reset token
    // 3. check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error("Invalid or expired token");
    }
    // 4. Hash their password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove old resetToken
    await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: { password, resetToken: null, resetTokenExpiry: null }
    });
    // 6. Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 7. Set the JWT cookie

    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // 8. return new user
    return user;
  },
  async updatePermission(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("you must be logged in");
    }
    const currentUser = await ctx.db.query.user(
      {
        where: {
          id: ctx.request.userId
        }
      },
      info
    );
    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);
    return ctx.db.mutation.updateUser(
      {
        data: {
          permission: {
            set: args.permission
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    );
  },
  async addToCart(parent, args, ctx, info) {
    // 1. User Logged in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error("You are not logged in");
    }
    // 2. fetch cart items
    const [itemInCart] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });
    // 3. if cart has same item update the quantity
    if (itemInCart) {
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: itemInCart.id },
          data: { quantity: itemInCart.quantity + 1 }
        },
        info
      );
    }
    // 4. if not add item to the cart
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    );
  },
  async deleteCartItem(parent, args, ctx, info) {
    const userId = ctx.request.userId;

    if (!userId) {
      throw new Error("You are not logged in");
    }
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id
        }
      },
      `{id,user{id}}`
    );
    if (!cartItem) {
      throw new Error("Item is not availabe in your cart");
    }
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error("you are not authorised");
    }
    return ctx.db.mutation.deleteCartItem({ where: { id: args.id } }, info);
  },
  async createOrder(parent, args, ctx, info) {
    // 1. Query the current user and make sure they are signed in
    const { userId } = ctx.request;
    if (!userId) throw new Error("You must sign in to complete the order");
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item {title price id description image largeImage}
        }}`
    );

    // 2. Recalculate the total for the price
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
      0
    );
    // 3. Create the stripe charge (turn token into $$$)
    const charge = await stripe.charges.create({
      amount,
      currency: "USD",
      source: args.token
    });
    // 4. convert the cartitems to orderitems
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } }
      };
      delete orderItem.id;
      return orderItem;
    });
    // 5. create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } }
      }
    });
    // 6. Clean up - clean the users cart, delete cartItems
    const cartItemsId = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemsId
      }
    });
    // 7. Return the order to the client
    return order;
  }
};

module.exports = mutations;
