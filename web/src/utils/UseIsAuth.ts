import router from "next/router";
import React, { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const UseIsAuth = () => {
  const [{ data, fetching }] = useMeQuery();
  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace("/login?next=" + router.pathname);
    }
  }, [fetching, data, router]);
};
