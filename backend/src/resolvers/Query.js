const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

//just for testing changes
const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },
  async users(parent, args, ctx, info) {
    // 1. if they are logged in
    if (!ctx.request.userId) {
      throw new Error("You must logged in!!");
    }
    // 2. check if the are authorisec to query all users
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);
    // 3. if they do , query all users
    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    // 1. Make sure they are logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in");
    }
    // 2. Query the current order
    const order = await ctx.db.query.order(
      {
        where: { id: args.id }
      },
      info
    );
    // 3. Check if the have permission to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permission.includes(
      "ADMIN"
    );
    if (!ownsOrder && !hasPermissionToSeeOrder) {
      throw new Error("Sorry you cannot see this order");
    }

    // 4. Return the order
    return order;
  },
  async orders(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You are not logged in");
    }
    const orders = ctx.db.query.orders(
      {
        where: { user: { id: ctx.request.userId } }
      },
      info
    );
    return orders;
  }
};

module.exports = Query;
