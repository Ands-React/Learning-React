import { useState, useRef, useEffect } from "react";
import { useForm  } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { v4 as uuidv4 } from "uuid";

import axios from "axios";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;

  const [fetchemployee, setfetchemployee] = useState([]);
  const formRef = useRef()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async(data) => {
    const employee = Object.values(data.employee)
    console.log(data)
    try{
      const res = await axios.post(apiUrl,employee)
      console.log(res)
    }catch(error){
      console.log(error)
    }
    
  };

  const handleAdd = () => {
    const emptyValue = {
      id: uuidv4(),
      Name: "",
      DateOfBirth: "",
      Salary: 0,
      Address: "",
    };

    setfetchemployee([emptyValue, ...fetchemployee]);
  };

  const handleUpdate = async () => {
    try {
      const employeeInfo = await axios.get(
        "http://nexifytw.mynetgear.com:45000/api/Record/GetRecords"
      );
      console.log(employeeInfo.data);
      const employeeInfoWithIDs = employeeInfo.data.Data.map((item) => ({
        id: uuidv4(),
        ...item,
      }));
      setfetchemployee(employeeInfoWithIDs);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (data) => {
    const result = fetchemployee.filter((employees) => employees !== data)
    setfetchemployee(result)
  }

  const handleCheck = () => {
    console.log(fetchemployee)
  }

  //重置useForm()表單字段。
  useEffect(() => {
    reset();
  },[fetchemployee,reset])

  return (
    <div className="container">
      {/* 按鈕渲染區 */}
      <div className="feature">
        <button className="addbutton" onClick={handleAdd}>
          Add
        </button>
        <button onClick={handleCheck}>check</button>
        <button className="savebutton" onClick={() => { formRef.current.requestSubmit() }}>Save</button>
        <button className="updatebutton" onClick={handleUpdate}>
          Update
        </button>
      </div>

      {/* 表格渲染區 */}
      <div className="employeeinfo">
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Birthday</th>
                <th>Salary</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {fetchemployee &&
                [...fetchemployee].map((rows) => (
                  <tr key={rows.id}>
                    <td>
                      <input
                        type="text"
                        defaultValue={rows.Name}
                        {...register(`employee.${rows.id}.name`, {required: "請輸入員工姓名"})}
                      />
                      <ErrorMessage className="errormessage" errors={errors} name={`employee.${rows.id}.name`} as="p" />
                    </td>
                    <td>
                      <input
                        type="date"
                        defaultValue={rows.DateOfBirth.split("T")[0]}
                        {...register(`employee.${rows.id}.DateOfBirth`, {required: "請輸入員工生日"})}
                      />
                      <ErrorMessage className="errormessage" errors={errors} name={`employee.${rows.id}.DateOfBirth`} as="p" />
                    </td>
                    <td className="salarybar">
                      <input
                        id="salary"
                        type="range"
                        defaultValue={rows.Salary}
                        min={0}
                        max={100000}
                        step={1}
                        {...register(`employee.${rows.id}.Salary`)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        defaultValue={rows.Address}
                        {...register(`employee.${rows.id}.Address`, {required: "請輸入員工住址"})}
                      />
                      <ErrorMessage className="errormessage" errors={errors} name={`employee.${rows.id}.Address`} as="p" />
                    </td>
                    <td  className="deletebutton"><button onClick={() => {handleDelete(rows)}}><FontAwesomeIcon icon={faTrashCan} size="lg" /></button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
}

export default App;
