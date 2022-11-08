import { Flex, Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import Link from "next/link";
import router, { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { toErrorMap } from "../utils/toErrorMap";
import login from "./login";
import NextLink from "next/link";
import { ValuesOfCorrectTypeRule } from "graphql";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import createUrqlClient from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { useEffect } from "react";
import { UseIsAuth } from "../utils/UseIsAuth";

const CreatePost: React.FC<{}> = () => {
  const [, createPost] = useCreatePostMutation();
  const router = useRouter();
  UseIsAuth();

  return (
    <Layout variant="small">
      {" "}
      <Wrapper variant="small">
        <Formik
          initialValues={{ title: "", text: "" }}
          onSubmit={async (values) => {
            const { error } = await createPost({ input: values });
            if (!error) {
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Box>
                <InputField name="title" placeholder="title" label="title" />
              </Box>
              <Box mt={4}>
                <InputField
                  textarea
                  name="text"
                  placeholder="text"
                  label="Body"
                />
              </Box>
              <Flex alignItems="center" justifyContent={"space-between"}>
                <Button
                  isLoading={isSubmitting}
                  mt={4}
                  type="submit"
                  color="teal"
                >
                  Create Post
                </Button>
              </Flex>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: false })(CreatePost);
