import React from "react";
import { withUrqlClient } from "next-urql";
import createUrqlClient from "../../../utils/createUrqlClient";
import { Flex, Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import router, { useRouter } from "next/router";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import Wrapper from "../../../components/Wrapper";
import createPost from "../../create-post";
import {
  usePostQuery,
  UpdatePostMutation,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";
import useGetIntId from "../../../utils/useGetIntId";

const EditPost = () => {
  const router = useRouter();
  const intId = useGetIntId();

  const [, updatePost] = useUpdatePostMutation();
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });

  if (fetching) {
    return <Layout>Loading..</Layout>;
  }
  return (
    <Layout variant="small">
      {" "}
      <Wrapper variant="small">
        <Formik
          initialValues={{ title: data?.post?.title, text: data?.post?.text }}
          onSubmit={async (values) => {
            /*     const { error } = await createPost({ input: values });
            if (!error) {
              router.push("/");
            } */
            console.log(intId, "sass");
            await updatePost({ id: intId, ...values });
            router.push("/");
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
                  Edit Post
                </Button>
              </Flex>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient)(EditPost);
