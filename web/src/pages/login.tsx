import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
/* import { useMutation } from "urql"; */
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import createUrqlClient from "../utils/createUrqlClient";
import NextLink from "next/link";
interface loginProps {}
const Login: React.FC<loginProps> = () => {
  const [, login] = useLoginMutation();
  const router = useRouter();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data.login.user) {
            if (typeof router.query.next === "string") {
              router.push(router.query.next || "/");
            } else {
              router.push("/");
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box>
              <InputField
                name="usernameOrEmail"
                placeholder="usernameOrEmail"
                label="usernameOrEmail"
                type="usernameOrEmail"
              />
            </Box>
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex alignItems="center" justifyContent={"space-between"}>
              <Button
                isLoading={isSubmitting}
                mt={4}
                type="submit"
                color="teal"
              >
                Login
              </Button>
              <Link mt={4}>
                {" "}
                <NextLink href="/forgot-password">Forgot password? </NextLink>
              </Link>
            </Flex>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default withUrqlClient(createUrqlClient, { ssr: false })(Login);
