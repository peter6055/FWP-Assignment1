import React, {useState} from "react";
import {message, Avatar, Button, Typography, Divider, Popconfirm, Row, Col, Comment, Card, Image, Modal, Form, Input, Alert, AutoComplete} from "antd";
import {QuestionCircleOutlined} from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';

import {changeEmail, getPosts,getReplys,changeName, getEmail, getJoinDate, deleteAccount ,getUserName, setMFA, getMFA, printProfilePost} from "../data/repository";
import $ from "jquery";

// TODO ------------------------------------------------------------------------------------------
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// TODO ------------------------------------------------------------------------------------------


const {Text, Paragraph} = Typography;

const Profile = (props) => {
    const navigate = useNavigate();
    const [Email, setEmail] = useState(getEmail(props.id));
    const [Name, setName] = useState(getUserName(props.id));
    const date = getJoinDate((props.id));
    //delete account
    const confirmSelected = () => {
        deleteAccount(props.id);
        props.logoutUser();
        navigate("/");
        const posts=getPosts();
        const newPosts=[];
        for(const post of posts){
            if (post.userId!==props.id){
                newPosts.push(post);
            }else{
                //delete reply here
                deleteReply(post.postId);
            }
        }
        localStorage.setItem("posts", JSON.stringify(newPosts));
        // delete reply message to others
        deleteReplied(props.id);
        message.success({
            content: 'Account deleted! You are now logout.',
        });
    };
    // when user account delete, call this function to delete this user's reply message
    function deleteReplied(userId){
        const replys=getReplys();
        const newReplys=[];
        let nextID="";
        for (const reply of replys){
            if (reply.userId!==userId){
                newReplys.push(reply);
            }else{
                nextID=reply.replyId;
            }
        }
        localStorage.setItem("replys", JSON.stringify(newReplys));
        if(nextID!==""){deleteReply(nextID);}
    }


    const handleNameChange = (event) => {
        if (changeName(props.id, event)) {
            setName(event);
            // refresh page to refresh props.id
            //window.location.reload(false);
            props.editName(event);
        }
    }
    const handleEmailChange = (event) => {
        if (changeEmail(props.id, event)) {
            setEmail(event);
        }
    }


    const editPostOnClick = (e) => {
        // this is the post content text already display on the entry
        var currentPostText = $(e.target).closest('.ant-comment-content').find('.postText > p').text();

        // hide read only and add a textarea
        $(e.target).closest('.ant-comment-content').find('.postText > p').css({display: "none"})

        {/*// TODO ------------------------------------------------------------------------------------------*/}
        $(e.target).closest('.ant-comment-content').find('.postText > .quill ').css({display: "inline"});
        {/*// TODO ------------------------------------------------------------------------------------------*/}

        // add a save btn after the content text
        $(e.target).closest('.ant-comment-content').find('.postText > button').css({display: "inline"});

        // hide edit post btn
        $(e.target).css({display: "none"});

    };

    function handleEditPost(e){
        // get post id
        const id=$(e.target).closest(".postText > button").attr( "postId");

        {/*TODO -------------------------------------------------------------------------------*/}
        // this is text of post
        const newText = $(e.target).closest('.ant-comment-content').find('.postText > .quill ').find('.ql-editor')[0].innerHTML;
        const newText_length = $(e.target).closest('.ant-comment-content').find('.postText > .quill ').find('.ql-editor')[0].innerText.length;
        {/*TODO -------------------------------------------------------------------------------*/}

        console.log(id);

        // frocen: this a new way to detect word limit due to formatted text implementation
        if (newText_length > 600 || !newText){
            message.error({
                content: 'Post message can not be empty or exceed 600 characters',
            });
            return
        }

        const posts=getPosts();
        for(const post of posts){
            if (post.postId===id){
                post.post_data[0] = newText;
            }
        }

        localStorage.setItem("posts", JSON.stringify(posts));
        setProfilePostData(printProfilePost(props.id, editPostOnClick, deletePost, handleEditPost));

        // recover to non-editable mode
        // remove text area
        {/*// TODO ------------------------------------------------------------------------------------------*/}
        $(e.target).closest('.ant-comment-content').find('.postText > .quill ').css({display: "none"});
        {/*// TODO ------------------------------------------------------------------------------------------*/}
        // show read only text
        $(e.target).closest('.ant-comment-content').find('.postText > p').css({display: "inline"})

        // hide save btn
        $(e.target).closest('.ant-comment-content').find('.postText > button').css({display: "none"});

        // show edit post btn
        $(e.target).closest('.ant-comment-content').find('.ant-comment-actions > li:first > span').css({display: "inline"});

        // successful msg
        message.success({
            content: "Edit successful",
        });
    }

    function deleteReply(id){
        const replys=getReplys();
        const newReplys=[];
        let nextID="";
        for (const reply of replys){
            if (reply.parentId!==id){
                newReplys.push(reply);
            }else{
                nextID=id;
            }
        }
        localStorage.setItem("replys", JSON.stringify(newReplys));
        if(nextID!==""){deleteReply(nextID);}
    }

    function deletePost(e){
        // get post id
        const id=$(e.target).closest(".ant-popover-inner-content").find('input').val();
        const posts=getPosts();
        const newPosts=[];
        for(const post of posts){
            if (post.postId!==id){
                newPosts.push(post);
            }else{
                //delete reply here
                deleteReply(id);
            }
        }
        localStorage.setItem("posts", JSON.stringify(newPosts));
        message.success({
            content: 'Post message deleted!',
        });
        setProfilePostData(printProfilePost(props.id, editPostOnClick, deletePost, handleEditPost));
    }
    const [postsProfileData, setProfilePostData] = useState(printProfilePost(props.id, editPostOnClick, deletePost, handleEditPost));
    // ============================================================== Post ===============================


    // ============================================================== MFA ===============================
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [mfaInputQuestion, setMfaInputQuestion] = useState("");
    const [mfaInputAnswer, setMfaInputAnswer] = useState("");

    // question sources: https://www.beyondtrust.com/blog/entry/reused-security-questions-can-pose-a-high-risk-learn-tips-tricks-to-mitigate-the-threat
    const mfaQuestionRecommendationOption = [
        { value: 'In what city were you born?' },
        { value: 'What is the name of your favorite pet?' },
        { value: 'What is your mother\'s maiden name?' },
        { value: 'What high school did you attend?' },
        { value: 'What was the name of your elementary school?' },
        { value: 'What was the make of your first car?' },
        { value: 'What was your favorite food as a child?' },
        { value: 'Where did you meet your spouse?' },
        { value: 'What year was your father (or mother) born?' },
    ];


    // Intro content source: https://www.onelogin.com/learn/what-is-mfa
    const MFAModal = () =>(
        <Modal className={"mfaSetupModal"} title="Set up Multi-factor Authentication" visible={isModalVisible} onOk={handleOk} okText={"Confirm to set MFA"} cancelButtonProps={{ style: { display: 'none' } }} onCancel={handleCancel}>
            <Alert message="You should remember the answer you put below. Following login will require you to answer this question. If you forgot it, we are not able to recover you account! Once setup you will not able to turn off it!" type="warning" showIcon />
            <br/>
            <p><strong>What is Multi-factor Authentication (MFA)?</strong></p>
            <p>Rather than just asking for a username and password, MFA requires one or more additional verification factors, which decreases the likelihood of a successful cyber attack.</p>
            <br/>
            <Form.Item label="Question">
                <AutoComplete id={"mfaTextQuestion"} placeholder={mfaInputQuestion} options={mfaQuestionRecommendationOption} />
            </Form.Item>
            <Form.Item label="Answer">
                <Input id={"mfaTextAnswer"} placeholder={mfaInputAnswer} />
            </Form.Item>
        </Modal>
    );

    const showModal = () => {
        // getMFA value first
        var result = getMFA(props.id);
        setIsModalVisible(true);

        console.log(result["mfaStatus"]);
        // hide answer
        if(result["mfaStatus"] == true){
            setMfaInputQuestion(result["mfaQuestion"]);
            setMfaInputAnswer("The actual answer is hidden...");
        } else {
            setMfaInputQuestion("Select a question or setup one yourself...");
            setMfaInputAnswer("Input your answer...");
        }
    };

    const handleOk = () => {
        let mfaQuestion = document.getElementById("mfaTextQuestion").value;
        let mfaAnswer = document.getElementById("mfaTextAnswer").value;
        let result = setMFA(props.id, mfaQuestion, mfaAnswer);

        if(result === true){
            setIsModalVisible(false);
            message.success({
                content: "Completed!",
            });

        } else {
            message.error({
                content: result,
            });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    // ============================================================== MFA ===============================


    return (
        <Row className={"profilePage safeArea"} style={{display: "flex", justifyContent: "center"}}>
            <Col span={5} style={{display: "flex", justifyContent: "flex-end"}}>
                <div className={"profileContainer"} style={{maxWidth: "370px"}}>
                    <Card style={{width: "100%"}}>
                        <Avatar size={100} alt="Han Solo"
                                className={"profilePageAvatar"}
                                style={{backgroundColor: "#f56a00", verticalAlign: 'middle', fontSize: '70px'}}>
                            {JSON.stringify(Name).charAt(1).toUpperCase()}
                        </Avatar>

                        <Typography.Title
                            editable={{
                                onChange: handleNameChange,
                            }}
                            level={3}
                            style={{
                                marginTop: "20px",
                                marginLeft: "2px",
                                marginBottom: "5px"
                            }}
                        >
                            {Name}
                        </Typography.Title>

                        <Paragraph
                            editable={{
                                onChange: handleEmailChange,
                                tooltip: 'click to edit text',
                            }}
                            style={{
                                marginLeft: "2px",
                                marginBottom: "30px"
                            }}
                        >
                            {Email}
                        </Paragraph>

                        {/*MFA not in use*/}
                        {/*<Button type="primary" onClick={showModal}>Setup MFA</Button>*/}
                        {/*<MFAModal></MFAModal>*/}
                        {/*<br/>*/}
                        {/*<br/>*/}
                        <Text type="secondary">{date}</Text>
                        <br/>
                        <br/>

                        <Divider orientation="center" plain>Danger Zone</Divider>

                        <Popconfirm
                            title={"After you delete your account, you are not able to login as a user. All of you post will be delete as well."}
                            icon={
                                <QuestionCircleOutlined
                                    style={{
                                        color: 'red',
                                    }}
                                />
                            }
                            onConfirm={confirmSelected}
                            placement="bottom"
                            okText="Delete Forever!"
                            cancelText="No"
                        >
                            <a><Button danger> Delete my account</Button></a>
                        </Popconfirm>
                    </Card>
                </div>
            </Col>
            <Col span={17} style={{maxWidth: "855px"}}>
                <div className={"postContainer"}>
                    {postsProfileData}
                </div>
            </Col>
        </Row>
    );

}


export default Profile;