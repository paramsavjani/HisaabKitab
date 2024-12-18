import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserContext from "../context/UserContext.js";

function Transactions() {
  const { user } = useContext(UserContext);
  const { chatId } = useParams();

  if (!user) {
    window.history.pushState({}, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  const userId = chatId.split("--")[0];
  const friendId = chatId.split("--")[1];

  if (!friendId || !userId) {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  if (user?.username !== userId) {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  useEffect(() => {
    document.title = "Transactions";
    async function fetchTransactions() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/v1/transactions/${friendId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data = await res.json();

        console.log(data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchTransactions();
  }, [user, friendId]);

  return (
    <div className="text-white">
      {/* {userID}
      {friendId} */}
    </div>
  );
}

export default Transactions;
