import { withUrqlClient } from "next-urql";
import React from "react";
import createUrqlClient from "../../utils/createUrqlClient";
import { useRouter } from "next/router";
import { usePostQuery } from "../../generated/graphql";
import Layout from "../../components/Layout";
import { Heading, Text } from "@chakra-ui/react";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post = () => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

  const [{ data, fetching }] = useGetPostFromUrl();
  console.log(data);
  return (
    <Layout>
      <Heading mb={4}>{data?.post?.title}</Heading>
      <Text>{data?.post?.text}</Text>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
