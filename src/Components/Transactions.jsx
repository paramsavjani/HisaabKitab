import React from "react";
import { useParams } from "react-router-dom";

function Transactions() {
  const { chatId } = useParams();
  return <div>{chatId}</div>;
}

export default Transactions;
