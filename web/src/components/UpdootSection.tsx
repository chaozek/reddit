import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React from "react";
import { useMutation } from "urql";
import { PostFragmentFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
  post: PostFragmentFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [, vote] = useVoteMutation();

  return (
    <Flex
      direction={"column"}
      justifyContent="center"
      alignItems={"center"}
      mr={"4"}
    >
      <IconButton
        onClick={() => {
          if (post.voteStatus === 1) {
            return;
          }
          vote({
            postId: post.id,
            value: 1,
          });
        }}
        color={post.voteStatus === 1 && "green"}
        aria-label="Search database"
        icon={<ArrowUpIcon />}
      />

      {post.points}
      <IconButton
        onClick={() => {
          if (post.voteStatus === -1) {
            return;
          }
          vote({
            postId: post.id,
            value: -1,
          });
        }}
        color={post.voteStatus === -1 && "red"}
        aria-label="Search database"
        icon={<ArrowDownIcon />}
      />
    </Flex>
  );
};

export default UpdootSection;
