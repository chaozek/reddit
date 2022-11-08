import { withUrqlClient } from "next-urql";
import createUrqlClient from "../../utils/createUrqlClient";

console.log("aaaa");

export default withUrqlClient(createUrqlClient, { ssr: true })("./[id]" as any);
