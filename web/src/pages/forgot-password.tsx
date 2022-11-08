import { Box, Button, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import createUrqlClient from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

const ForgotPassword = () => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>If an email exists, we will send password on it.</Box>
          ) : (
            <Form>
              <Box>
                <InputField
                  name="email"
                  placeholder="email"
                  label="email"
                  type="email"
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
              </Flex>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(ForgotPassword);
