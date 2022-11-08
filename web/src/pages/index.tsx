import { withUrqlClient } from "next-urql";
import {
  usePostsQuery,
  useDeletePostMutation,
  useMeQuery,
} from "../generated/graphql";
import createUrqlClient from "../utils/createUrqlClient";
import Layout from "../components/Layout";
import { DeleteIcon } from "@chakra-ui/icons";
import { EditIcon } from "@chakra-ui/icons";

import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import UpdootSection from "../components/UpdootSection";
import { useUpdatePostMutation } from "../generated/graphql";
const Index = () => {
  const [variables, setVariables] = useState({ limit: 10, cursor: null });
  const [{ data, fetching }] = usePostsQuery({ variables });
  const [{ data: meData }] = useMeQuery();
  const [, deletePost] = useDeletePostMutation();
  const [, updatePost] = useUpdatePostMutation();
  return (
    <Layout>
      <Flex>
        <Heading mb={4}>
          <NextLink href="create-post">
            <Link>Create Post</Link>
          </NextLink>
        </Heading>
      </Flex>
      {fetching && !data ? (
        <div>loading</div>
      ) : (
        <Stack spacing={8}>
          {data?.posts?.posts.map((p) => (
            <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
              <UpdootSection post={p} />
              <Box>
                <Link>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Heading>{p.title}</Heading>
                  </NextLink>
                </Link>
                <Text> Posted By {p.creator.username}</Text>
                {meData?.me?.id === p.creator.id ? (
                  <>
                    <IconButton
                      onClick={() => deletePost({ id: p.id })}
                      icon={<DeleteIcon />}
                      aria-label="delete-post"
                    />
                    <NextLink href="/post/edit/[id]" as={`/post/edit/${p.id}`}>
                      <Link>
                        <IconButton
                          icon={<EditIcon />}
                          aria-label="edit-post"
                        />
                      </Link>
                    </NextLink>
                  </>
                ) : (
                  ""
                )}
                <Text mt="4">{p.textSnippet}</Text>
              </Box>
            </Flex>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Button
          onClick={() => {
            setVariables({
              limit: variables.limit,
              cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
            });
          }}
          isLoading={fetching}
          my={4}
        >
          Load More
        </Button>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(
  createUrqlClient,
  { ssr: true } // Enables server-side rendering using `getInitialProps`,
)(Index);
