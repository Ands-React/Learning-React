import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import axios from "axios";

function App() {
  const form = useForm({
    // 非同步預設值方法
    /* defaultValues: async () => {
      const res = await axios.get("https://jsonplaceholder.typicode.com/users");
      return {
        username: res.data[0].username,
        email: res.data[0].email,
        channel: "",
      };
    } */

    defaultValues: {
      username: "Ands",
      email: "example!123@gmail.com",
      channel: "",
      social: {
        X: "Ands Liao",
        facebook: "Ands Liao",
      },
      primaryNumber: ["", ""],
    },
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = form;

  const onSubmit = async (data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });

    // 確保文件添加到 FormData 中
    formData.append("image", data.image[0]);

    console.log(data);
    await axios
      .post("http://localhost:3000/api/data", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
    try {
      const response = await axios.post(
        "http://localhost:3000/api/data",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(response.data)
    } catch (error) {
      console.log(error);
    }
  };

  // 取得特定欄位value
  const handlevalues = () => {
    console.log(getValues("username"));
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="fieldformat">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            {...register("username", {
              required: {
                value: true,
                message: "Username is required",
              },
            })}
          />
          <p className="errormesaage">{errors.username?.message}</p>
        </div>

        <div className="fieldformat">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register("email", {
              pattern: {
                value: /^[\w\W]+@\w+\.\w+$/,
                message: "Invaild email format",
              },
              validate: {
                notAdmin: (FieldValues) => {
                  if (FieldValues === "admin@example.com")
                    return "Enter different a email";
                },
                notBlackListed: (FieldValues) => {
                  if (FieldValues.endsWith("baddomain.com"))
                    return "This domain is not supported";
                },
              },
            })}
          ></input>
          <p className="errormesaage">{errors.email?.message}</p>
        </div>

        <div className="fieldformat">
          <label htmlFor="channel">Channel</label>
          <input
            id="channel"
            type="text"
            {...register("channel", {
              required: {
                value: true,
                message: "channel is required",
              },
            })}
          ></input>
          <p className="errormesaage">{errors.channel?.message}</p>
        </div>

        <div className="fieldformat">
          <label htmlFor="X">X</label>
          <input
            id="X"
            type="text"
            {...register("social.X", {
              required: {
                value: true,
                message: "this fiel is empty",
              },
            })}
          ></input>
          <p className="errormesaage">{errors.social?.X?.message}</p>
        </div>

        <div className="fieldformat">
          <label htmlFor="facebook">facebook</label>
          <input
            id="facebook"
            type="text"
            {...register("social.facebook", {
              required: {
                value: true,
                message: "this fiel is empty",
              },
            })}
          ></input>
          <p className="errormesaage">{errors.social?.facebook?.message}</p>
        </div>

        <div className="fieldformat">
          <label htmlFor="primary-phone">Primary Phone Number</label>
          <input
            id="primary-phone"
            type="text"
            {...register("primaryNumber.0", {
              pattern: {
                value: /^[\d]{4,9}$/,
                message: "只能是數字並且至少4到9碼",
              },
              validate: {
                notZero: (FieldValues) => {
                  const regex =
                    /^0+$|^1+$|^2+$|^3+$|^4+$|^5+$|^6+$|^7+$|^8+$|^9+$/;
                  if (FieldValues.match(regex)) return "該欄位不能都是單一數字";
                },
              },
              required: {
                value: true,
                message: "該欄位不能為空",
              },
            })}
          ></input>
          <p className="errormesaage">{errors.primaryNumber?.[0]?.message}</p>
        </div>

        <div>
          <label htmlFor="second-phone">Second Phone Number</label>
          <input
            id="second-phone"
            type="text"
            {...register("primaryNumber.1")}
          ></input>
        </div>

        <div className="fieldformat">
          <label htmlFor="image">Upload image</label>
          <input id="image" type="file" {...register("image")}></input>
        </div>

        <button className="button-layout" onClick={handlevalues}>
          Submit
        </button>
      </form>
      <DevTool control={control} />
    </div>
  );
}

export default App;
