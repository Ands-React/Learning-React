import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { setLogin } from "./features/profileSlice";
import { openLoginUI } from "./features/uiSlice";

export const LoginUI = () => {
  const dispatch = useDispatch();
  const light = useSelector((state) => state.ui.light);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    dispatch(setLogin(data));
  };

  const handleCancel = () => {
    dispatch(openLoginUI());
    reset();
  };

  return (
    <>
      <div className={` ${light ? "lightmode" : "darkmode"}`}>
        <form className="loginUI" onSubmit={handleSubmit(onSubmit)}>
          <h2>登入介面</h2>
          <div className="fieldformat">
            <label htmlFor="account">帳號</label>
            <input
              id="account"
              placeholder="請輸入帳號"
              {...register("username", {
                required: {
                  value: true,
                  message: "必須輸入帳號",
                },
                pattern: {
                  value: /^[\w!@#$%]+$/,
                  message: "只包含英文和數字和!@#$%",
                },
                validate: {
                  notSpace: (FieldValues) => {
                    const regex = new RegExp("\\s+", "g");
                    if (regex.test(FieldValues)) return "輸入欄位不能有空格";
                  },
                },
              })}
            />
            <p className="errormessage">{errors.username?.message}</p>
          </div>

          <div className="fieldformat">
            <label htmlFor="pwd">密碼</label>
            <input
              type="password"
              id="pwd"
              placeholder="請輸入密碼"
              {...register("password", {
                required: {
                  value: true,
                  message: "必須輸入密碼",
                },
                pattern: {
                  value: /^[\w!@#$%]+$/,
                  message: "只包含英文和數字和!@#$%",
                },
                validate: {
                  notSpace: (FieldValues) => {
                    const regex = new RegExp("\\s+", "g");
                    if (regex.test(FieldValues)) return "輸入欄位不能有空格";
                  },
                },
              })}
            />
            <p className="errormessage">{errors.password?.message}</p>
          </div>
          <div className="login">
            <button type="submit" className="btnlogin">
              確定
            </button>
            <button type="button" className="btnlogin" onClick={handleCancel}>
              取消
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
