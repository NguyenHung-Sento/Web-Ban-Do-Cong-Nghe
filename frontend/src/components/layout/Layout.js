"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./Header";
import Footer from "./Footer";
import { fetchCart } from "../../features/cart/cartSlice";
import Chatbot from "../chatbot/Chatbot";
import { FacebookMessage } from "../facebook/FacebookMessage";

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchCart());
    }
  }, [dispatch, isLoggedIn]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Chatbot />
      <FacebookMessage/>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Layout;
