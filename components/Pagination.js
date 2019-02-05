import React from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import Link from "next/link";
import Head from "next/head";
import { perPage } from "../config";
import PaginationStyles from "./styles/PaginationStyles";

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = props => {
  return (
    <Query query={PAGINATION_QUERY}>
      {({ loading, error, data }) => {
        if (loading) return <p>Loading..</p>;
        if (error) return <p>Error {error.message}</p>;
        const count = data.itemsConnection.aggregate.count;
        const pages = Math.ceil(count / perPage);
        const currPage = props.page;
        return (
          <PaginationStyles>
            <Head>
              <title>
                Sick Fits! - Page {currPage} of {pages}
              </title>
            </Head>
            <Link
              prefetch
              href={{
                pathname: "items",
                query: { page: currPage - 1 }
              }}
            >
              <a className="prev" aria-disabled={currPage <= 1}>
                ← Prev
              </a>
            </Link>
            <p>
              Page {currPage} of {pages}
            </p>
            <p>{count} items</p>
            <Link
              prefetch
              href={{
                pathname: "items",
                query: { page: currPage + 1 }
              }}
            >
              <a className="prev" aria-disabled={currPage >= pages}>
                Next →
              </a>
            </Link>
          </PaginationStyles>
        );
      }}
    </Query>
  );
};

export default Pagination;
