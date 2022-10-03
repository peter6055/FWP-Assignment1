import {message, Col, Row, Input, Space, Button, Alert, Modal, Form} from 'antd';
import {UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone} from '@ant-design/icons';

import AccountPageBg from "../assets/account-page-bg.svg";
import Logo from '../assets/logo.svg'
import React, {useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getMFA, getMFAStatus, verifyMFAAnswer, verifyUser, setUser} from "../data/repository";
import {Link} from "react-router-dom";

//!!! we use some code from week3 lec example 10 as start code like handleInputChange handleSubmit functions.!!!
const Login = (props) => {
    const [fields, setFields] = useState({username: "", password: ""});
    const idTemp = useRef(0);

    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const result = verifyUser(fields.username, fields.password);

        //set a temp id for later use
        idTemp.current = result;

        // If verified login the user.

        if(result === "error.usr.isempty"){
            setErrorMessage("Username should not be empty.");

        } else if (result === "error.pswd.isempty") {
            setErrorMessage("Password should not be empty.");

        } else if (result === "not-authorised.credential.incorrect") {
            // Set error message.
            setErrorMessage("Username and / or password invalid, please try again.");

            // no error means user is correct
        } else {
            // verify MFA if they setup MFA
            if(getMFAStatus(idTemp.current) == true){
                //handle verify
                handleVerify();
            } else {
                credentialVerified();
            }

        }
    }

    const credentialVerified = () =>{
        setUser(idTemp.current);
        props.loginUser(idTemp.current);
        localStorage.setItem("user", JSON.stringify(idTemp.current));

        // Navigate to the home page.
        navigate("/profile");

        message.success({
            content: 'Login successful',
        });
    }


    // Generic change handler.
    const handleInputChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        // Copy fields.
        const temp = {username: fields.username, password: fields.password};
        // Update field and state.
        temp[name] = value;
        setFields(temp);
    }


    // ============================================================== MFA ===============================
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [mfaInputQuestion, setMfaInputQuestion] = useState("");
    const MFAModal = () =>(
        <Modal title="Multi-factor Authentication" visible={isModalVisible} onOk={handleOk} okText={"Submit"} cancelButtonProps={{ style: { display: 'none' } }} onCancel={handleCancel}>
            <p><strong>You had setup MFA, please answer:</strong></p>
            <p>Question: {mfaInputQuestion}</p>
            <Form.Item label="Answer">
                <Input id={"mfaTextAnswer"} placeholder="Please enter the answer. (Case sensitive)" />
            </Form.Item>
        </Modal>
    );

    const handleVerify = () => {
        // getMFA value first
        var result = getMFA(idTemp.current);
        setIsModalVisible(true);
        setMfaInputQuestion(result["mfaQuestion"]);
    };

    const handleOk = () => {
        let mfaAnswer = document.getElementById("mfaTextAnswer").value;
        let result = verifyMFAAnswer(idTemp.current, mfaAnswer);


        if(result === true){
            credentialVerified();
        } else {
            setErrorMessage(result);
        }
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        document.getElementById("mfaTextAnswer").value = "";
        setIsModalVisible(false);
        setErrorMessage("MFA Cancel, not authorised, please try again!");
    };
    // ============================================================== MFA ===============================


    return (
        <Row style={{height: 'calc(100vh - 50px)'}}>
            <Col className={"login-page login-page-left"} span={12} style={{}}>
                <img src={Logo} width={300} style={{paddingBottom: "20px"}} alt="Logo"></img>
                <img src={AccountPageBg} width={400} alt="AccountPageBg"></img>
            </Col>
            <Col className={"login-page login-page-right"} span={12} style={{}}>
                <form id={"login-form"}>
                    <h1><strong>Login to LAN</strong></h1>

                    <p>Username</p>
                    <Input size="large" name="username" placeholder="Input username" onChange={handleInputChange}
                           prefix={<UserOutlined/>}/>
                    <br/>
                    <br/>

                    <p>Password</p>
                    <Space direction="vertical" style={{width: "100%"}}>
                        <Input.Password
                            id="passwordInputBox"
                            name="password"
                            size="large"
                            onChange={handleInputChange}
                            placeholder="Input password"
                            iconRender={(visible) => (visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>)}
                            prefix={<LockOutlined/>}
                        />
                    </Space>
                    <br/>
                    <br/>
                    <MFAModal></MFAModal>
                    {errorMessage !== null && <Alert message={errorMessage} type="error" showIcon />}

                    <br/>
                    <Button type="primary" size={"default"} onClick={handleSubmit}>Login</Button>
                    <span>&nbsp;&nbsp;&nbsp;&nbsp;or
                    <Link className={"link"} to="/signup" state={"From Contact Page"}>&nbsp;Sign up</Link>
                </span>
                </form>
            </Col>
        </Row>);
}


export default Login;