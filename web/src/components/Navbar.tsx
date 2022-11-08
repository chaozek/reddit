import React from "react";
import { Box, Button, Flex, Link, Spacer, Heading } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
type NavBarProps = {};
const Navbar: React.FC<NavBarProps> = () => {
  const [isServer, setIsServer] = useState(true);
  const router = useRouter();
  useEffect(() => setIsServer(false), []);

  const [{ data, fetching }] = useMeQuery({
    pause: isServer,
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  let body = null;
  if (fetching) {
    body = null;
  } else if (data?.me == null) {
    body = (
      <>
        <NextLink href="/login">
          <Link color="white" mr={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white">Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex>
        <Box mr="2">{data.me.username}</Box>
        <Button
          isLoading={logoutFetching}
          onClick={async () => {
            //@ts-expect-error
            await logout();
            router.reload();
          }}
          variant="link"
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex zIndex={0} position="sticky" top={0} bg="tomato" p={4} align="center">
      <Link>
        <NextLink href="/">
          <Heading>XXX</Heading>
        </NextLink>
      </Link>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};
export default Navbar;
