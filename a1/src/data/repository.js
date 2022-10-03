import {v4 as uuidv4} from 'uuid';
import {
    message,
    Avatar,
    Button,
    Typography,
    Divider,
    Popconfirm,
    Row,
    Col,
    Comment,
    Card,
    Image,
    Modal,
    Form,
    Input,
    Alert,
    AutoComplete
} from "antd";
import {
    QuestionCircleOutlined,
    LikeFilled,
    DislikeFilled,
    StarFilled,
    PlusCircleFilled,
    CloseCircleFilled
} from '@ant-design/icons';
import $ from 'jquery';
import ReactQuill from "react-quill";
import React from "react";

const USERS_KEY = "users";
const USER_KEY = "user";
const POST_DATABASE = "posts";
const REPLY_DATABASE = "replys";
//!!! we use some code from week3 lec example 10 as start code like initUsers verifyUser getter setter functions.!!!
// Initialise local storage with empty data, if the data is already set this function returns immediately.
function initUsers() {
    // Stop if data is already initialised.
    if (localStorage.getItem(USERS_KEY) !== null)
        return;

    const users = [];
    const posts = [];
    const replys = [];
    // Set data into local storage.
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(POST_DATABASE, JSON.stringify(posts));
    localStorage.setItem(REPLY_DATABASE, JSON.stringify(replys));
}

// Initialise

// creating
function createUsers(username, password, email) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const d = new Date();
    let day = days[d.getDay()];
    let date = d.getDate()
    let month = months[d.getMonth()];
    let year = d.getFullYear();
    const JoinDate = `${day} ${date} ${month} ${year}`;
    const id = generateId();
    const user =
        {
            username: username,
            password: password,
            email: email,
            JoinDate: JoinDate,
            mfaStatus: false,
            mfaQuestion: "",
            mfaAnswer: "",
            id: id
        };

    const users = getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(USER_KEY, JSON.stringify(id));
    return id;
}

function createPost(userId, text, images) {
    const posts = getPosts();
    const postData = [text];
    for (const image of images) {
        postData.push(image);
    }
    const d = new Date();
    let date = d.getDate()
    let month = d.getMonth();
    let year = d.getFullYear();
    let hour = d.getHours();
    let minutes = d.getMinutes()
    const post_time = `${year}-${month}-${date} ${hour}:${minutes}`;
    const post =
        {
            userId: userId,
            postId: generateId(),
            post_data: postData,
            post_time: post_time
        };
    posts.push(post);
    localStorage.setItem(POST_DATABASE, JSON.stringify(posts));
}

function createReply(userId, parentId, text) {
    const replys = getReplys();
    const d = new Date();
    let date = d.getDate()
    let month = d.getMonth();
    let year = d.getFullYear();
    let hour = d.getHours();
    let minutes = d.getMinutes()
    const reply_time = `${year}-${month}-${date} ${hour}:${minutes}`;
    const reply = {
        userId: userId,
        parentId: parentId,
        replyId: generateId(),
        reply_data: text,
        reply_time: reply_time
    }
    replys.push(reply);
    localStorage.setItem(REPLY_DATABASE, JSON.stringify(replys));
}

function generateId() {
    return uuidv4();
}

// creating

// getter setter delete
function getUsers() {
    // Extract user data from local storage.
    const data = localStorage.getItem(USERS_KEY);

    // Convert data to objects.
    return JSON.parse(data);
}

function getPosts() {
    // Extract posts data from local storage.
    const data = localStorage.getItem(POST_DATABASE);

    // Convert data to objects.
    return JSON.parse(data);
}

function getReplys() {
    // Extract reply data from local storage.
    const data = localStorage.getItem(REPLY_DATABASE);

    // Convert data to objects.
    return JSON.parse(data);
}


function getUserName(id) {
    const users = getUsers();
    if (users[0] === undefined) {
        return null;
    } else {
        for (const user of users) {
            if (id === user.id) {
                return user.username;
            }
        }
    }
}

function getJoinDate(id) {
    const users = getUsers();
    for (const user of users) {
        if (id === user.id) {
            return user.JoinDate;
        }
    }
}

function getEmail(id) {
    const users = getUsers();
    for (const user of users) {
        if (id === user.id) {
            return user.email;
        }
    }
}

// NOTE: In this example the login is also persistent as it is stored in local storage.
function verifyUser(username, password) {
    const users = getUsers();
    for (const user of users) {
        if (username === user.username && password === user.password) {
            setUser(user.id);
            return user.id;
        }
    }
}

function setUser(id) {
    localStorage.setItem(USER_KEY, id);
}

function getUser() {
    let data = localStorage.getItem(USER_KEY);
    return JSON.parse(data)
}

function removeUser() {
    localStorage.removeItem(USER_KEY);
}

function getNameByReplyId(id) {
    const users = getUsers();
    const replys = getReplys();
    let userId = "";
    for (const reply of replys) {
        if (id === reply.replyId) {
            userId = reply.userId;
        }
    }
    for (const user of users) {
        if (userId === user.id) {
            return user.username
        }
    }
}

function changeName(id, newUsername) {
    const newUsers = [];
    const users = getUsers();
    for (const user of users) {
        if (id === user.id) {
            user.username = newUsername;
        }
        newUsers.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    return true;

}

function changeEmail(id, newEmail) {
    if (/\S+@\S+\.\S+/.test(newEmail)) {
        const users = getUsers();
        for (const user of users) {
            if (id === user.id) {
                user.email = newEmail;
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
            }
        }
        return true
    } else {
        message.error({
            content: 'Please input a valid email address',
        });
    }
}

function deleteAccount(id) {
    const users = getUsers();
    const newUsers = [];
    for (const user of users) {
        if (id !== user.id) {
            newUsers.push(user);
        }
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
    removeUser();
}

// getter setter delete

// ============================================================== MFA ===============================
function setMFA(id, mfaQuestion, mfaAnswer) {
    if (id !== "" && mfaQuestion !== "" && mfaAnswer !== "") {
        const users = getUsers();
        for (const user of users) {
            if (id === user.id) {
                user.mfaStatus = true;
                user.mfaQuestion = mfaQuestion;
                user.mfaAnswer = mfaAnswer;
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
                return true;
            }
        }
        return "Username props error, please refresh the page. (msg: no usr found)";

    } else {
        if (mfaQuestion === "") {
            return "Question should not be empty";

        } else if (mfaAnswer === "") {
            return "Answer should not be empty, case sensitive";

        } else if (id === "") {
            return "ID props error, please refresh the page. (msg: no usr input)";

        }
        return false;
    }
}


function getMFA(id) {
    var result = [];
    if (id !== "") {
        const users = getUsers();
        for (const user of users) {
            if (id === user.id) {
                result["mfaStatus"] = user.mfaStatus;
                result["mfaQuestion"] = user.mfaQuestion;
                if (user.mfaAnswer != null) {
                    result["mfaAnswer"] = true;
                }
                return result;
            }
        }
        return "ID props error, please refresh the page. (msg: no usr found)";

    } else {
        return "ID props error, please refresh the page. (msg: no usr input)";
    }
}

function getMFAStatus(id) {
    if (id !== "") {
        const users = getUsers();
        for (const user of users) {
            if (id === user.id) {
                if (user.mfaStatus === true) {
                    return true
                } else {
                    return false
                }
            }
        }
        return "ID props error, please refresh the page. (msg: no usr found)";

    } else {
        return "ID props error, please refresh the page. (msg: no usr input)";
    }
}

function verifyMFAAnswer(id, mfaAnswer) {
    if (id !== "" && mfaAnswer !== "") {
        const users = getUsers();
        for (const user of users) {
            if (id === user.id) {
                if (user.mfaStatus === true) {
                    if (user.mfaAnswer === mfaAnswer) {
                        return true;
                    } else {
                        return "MFA answer Incorrect, not authorised, please try again!";
                    }
                } else {
                    return "MFA not set, not require to authorise";
                }
            }
        }
        return "Username props error, please refresh the page. (msg: no usr found)";

    } else {
        if (mfaAnswer === "") {
            return "Answer should not be empty, case sensitive, please try again!";

        } else if (id === "") {
            return "ID props error, please refresh the page. (msg: no usr input)";

        }
    }
}

// ============================================================== MFA ===============================

// generate post and reply depends on local storage database
function printPost(handleReplySubmit, handleReplyOnClick, handleReactionSubmit, handleFollowSubmit) {
    let print = [];
    const posts = getPosts();
    for (const post of posts) {
        const id = post.userId;
        const post_id = post.postId;
        // generate image tags depends on local storage
        const images = [];
        let i = 1;
        while (i < post.post_data.length) {
            let URL = post.post_data[i].url;
            images.push(<Image className={"center-cropped"} width={"12vh"} src={URL}/>)
            i++;
        }
        print.push(
            <Card style={{width: "100%", marginTop: "12px"}}>
                <Comment
                    actions={[
                        <div>
                        <span key="comment-nested-reply-to" className={"reply"} onClick={handleReplyOnClick}
                              style={{cursor: "pointer"}}>
                            Reply
                            <replyinput style={{display: "none"}}>
                                <Comment
                                    avatar={
                                        <Avatar alt={getUserName(id)} className={"postAvatar"} size="default" style={{
                                            backgroundColor: "#f56a00",
                                            verticalAlign: 'middle',
                                            fontSize: '17px'
                                        }}>
                                            {JSON.stringify(getUserName(id)).charAt(1).toUpperCase()}
                                        </Avatar>
                                    }
                                    content={
                                        <div className={"reply-input-box"}>
                                            <Form.Item>

                                                {/*TODO -------------------------------------------------------------------------------*/}
                                                <ReactQuill id="postTextItem" theme="snow"
                                                            placeholder={"Write a post..."}></ReactQuill>
                                                {/*TODO -------------------------------------------------------------------------------*/}

                                            </Form.Item>
                                            <Form.Item>
                                                <Button htmlType="submit" style={{marginTop: "10px"}}
                                                        parentId={post.postId} onClick={handleReplySubmit}
                                                        type="primary">Reply</Button>
                                            </Form.Item>
                                        </div>
                                    }
                                >
                                </Comment>
                            </replyinput>
                        </span>
                            <br/><br/>
                            <span className={"reaction reaction-like"} style={{cursor: "pointer"}} reaction={"like"}
                                  target_id={post_id} target_type={"post"} onClick={handleReactionSubmit}><LikeFilled/>  Like(x)</span>
                            <span className={"reaction reaction-dislike"} style={{cursor: "pointer"}}
                                  reaction={"dislike"} target_id={post_id} target_type={"post"}
                                  onClick={handleReactionSubmit}><DislikeFilled/>  Dislike(x)</span>
                            <span className={"reaction reaction-star"} style={{cursor: "pointer"}} reaction={"star"}
                                  target_id={post_id} target_type={"post"} onClick={handleReactionSubmit}><StarFilled/>  Star(x)</span>

                        </div>
                    ]}
                    author={<a>{getUserName(id)}</a>}
                    avatar={<Avatar alt={getUserName(id)} className={"postAvatar"} size="default" style={{
                        backgroundColor: "#f56a00",
                        verticalAlign: 'middle',
                        fontSize: '17px'
                    }}>
                        {JSON.stringify(getUserName(id)).charAt(1).toUpperCase()}
                    </Avatar>}
                    content={
                        <div>
                            <p>
                                {post.post_data[0]}
                            </p>
                            <div className={"postImageGroup"}>
                                {images}
                            </div>
                        </div>
                    }
                    datetime={
                        <div>
                            <div style={{display: "flex"}}>{post.post_time}
                                {/* TODO: if have follow this user, display this*/}
                                {/*<div className={"follow-btn has-follow"} style={{position: "absolute", right: 0, top: 0}}*/}
                                {/*     user_id={id} action={"unfollow"} username={getUserName(id)} onClick={handleFollowSubmit}><CloseCircleFilled/> Unfollow*/}
                                {/*</div>*/}

                                {/* TODO: if have not follow this user, display this*/}
                                <div className={"follow-btn"} style={{position: "absolute", right: 0, top: 0}}
                                    user_id={id} action={"follow"} username={getUserName(id)} onClick={handleFollowSubmit}><PlusCircleFilled />  Follow @{getUserName(id)}
                                </div>
                            </div>
                        </div>
                    }
                >
                    {printPostReplys(post.postId, handleReplyOnClick, handleReplySubmit, handleReactionSubmit)}
                </Comment>
            </Card>
        );
    }
    return <div>{print}</div>;
}

function printProfilePost(id, editPostOnClick, deletePost, handleEditPost) {
    let print = [];
    const posts = getPosts();
    for (const post of posts) {
        const images = [];
        let i = 1;
        while (i < post.post_data.length) {
            let URL = post.post_data[i].url;
            images.push(<Image className={"center-cropped"} width={"12vh"} src={URL}/>)
            i++;
        }
        if (post.userId === id) {
            print.push(
                <Card style={{width: "100%", marginTop: "12px"}}>
                    <Comment
                        actions={[
                            <span className={"clickable-text"} key="comment-nested-reply-to" onClick={editPostOnClick}>Edit post</span>,
                            <Popconfirm
                                title={<div><p>You sure you want to delete this post?</p><input type={"hidden"}
                                                                                                name="postId"
                                                                                                value={post.postId}></input>
                                </div>}
                                icon={
                                    <QuestionCircleOutlined
                                        style={{
                                            color: 'red',
                                        }}
                                    />
                                }
                                onConfirm={deletePost}
                                placement="bottom"
                                okText="Delete Forever!"
                                cancelText="No"
                            >
                                <span className={"danger-text"} key="comment-nested-reply-to"
                                      type="danger">Delete post</span>

                            </Popconfirm>
                        ]}
                        author={<a>{getUserName(id)}</a>}
                        avatar={<Avatar alt={getUserName(id)} className={"postAvatar"} size="default" style={{
                            backgroundColor: "#f56a00",
                            verticalAlign: 'middle',
                            fontSize: '17px'
                        }}>
                            {JSON.stringify(getUserName(id)).charAt(1).toUpperCase()}
                        </Avatar>}
                        content={
                            <div>
                                <div className={"postText"}>
                                    <p>
                                        {post.post_data[0]}
                                    </p>
                                    {/*// TODO ------------------------------------------------------------------------------------------*/}
                                    <ReactQuill theme="snow" placeholder={"Write a post..."} style={{display: "none"}}
                                                value={post.post_data[0]}/>
                                    {/*// TODO ------------------------------------------------------------------------------------------*/}
                                    <Button type="primary" postId={post.postId} onClick={handleEditPost}
                                            style={{marginTop: "20px", display: "none"}}>Save changes</Button>
                                </div>
                                <div className={"postImageGroup"}>
                                    {images}
                                </div>
                            </div>
                        }
                        datetime={
                            post.post_time
                        }
                    >
                        {printProfileReplys(post.postId)}
                    </Comment>
                </Card>
            );
        }
    }
    return <div>{print}</div>;
}

function printPostReplys(parentId, handleReplyOnClick, handleReplySubmit, handleReactionSubmit) {
    const replys = getReplys();
    let print = [];
    for (const reply of replys) {
        if (reply.parentId === parentId) {
            const name = getNameByReplyId(reply.replyId);
            const reply_id = reply.replyId;

            print.push(<Comment
                actions={[
                    <div>
                            <span key="comment-nested-reply-to" onClick={handleReplyOnClick} className={"reply"}
                                  style={{cursor: "pointer"}}>
                                Reply
                                <replyinput style={{display: "none"}}>
                                    <Comment
                                        avatar={
                                            <Avatar alt={name} className={"postAvatar"} size="default" style={{
                                                backgroundColor: "#f56a00",
                                                verticalAlign: 'middle',
                                                fontSize: '17px'
                                            }}>
                                                {JSON.stringify(name).charAt(1).toUpperCase()}
                                            </Avatar>
                                        }
                                        content={
                                            <div className={"reply-input-box"}>
                                                <Form.Item>
                                                    {/*// TODO ------------------------------------------------------------------------------------------*/}
                                                    <ReactQuill id="postTextItem" theme="snow"
                                                                placeholder={"Write a post..."}/>
                                                    {/*// TODO ------------------------------------------------------------------------------------------*/}
                                                </Form.Item>
                                                <Form.Item>
                                                    <Button htmlType="submit" style={{marginTop: "10px"}}
                                                            parentId={reply.replyId} onClick={handleReplySubmit}
                                                            type="primary">Reply</Button>
                                                </Form.Item>
                                            </div>
                                        }
                                    >
                                    </Comment>
                                </replyinput>
                            </span>
                        <br/><br/>
                        <span className={"reaction reaction-like"} style={{cursor: "pointer"}} reaction={"like"}
                              target_id={reply_id} target_type={"reply"} onClick={handleReactionSubmit}><LikeFilled/>  Like(x)</span>
                        <span className={"reaction reaction-dislike"} style={{cursor: "pointer"}} reaction={"dislike"}
                              target_id={reply_id} target_type={"reply"} onClick={handleReactionSubmit}><DislikeFilled/>  Dislike(x)</span>
                        <span className={"reaction reaction-star"} style={{cursor: "pointer"}} reaction={"star"}
                              target_id={reply_id} target_type={"reply"} onClick={handleReactionSubmit}><StarFilled/>  Star(x)</span>
                    </div>
                ]}
                author={<a>{name}</a>}
                avatar={
                    <Avatar alt={name} className={"postAvatar"} size="default" style={{
                        backgroundColor: "#f56a00",
                        verticalAlign: 'middle',
                        fontSize: '17px'
                    }}>
                        {JSON.stringify(name).charAt(1).toUpperCase()}
                    </Avatar>
                } content={
                <p>
                    {reply.reply_data}
                </p>
            }
            >
                {printPostReplys(reply.replyId, handleReplyOnClick, handleReplySubmit, handleReactionSubmit)}
            </Comment>)
        }
    }
    return <div>{print}</div>;
}

function printProfileReplys(parentId) {
    const replys = getReplys();
    let print = [];
    for (const reply of replys) {
        if (reply.parentId === parentId) {
            const name = getNameByReplyId(reply.replyId);
            print.push(<Comment
                author={<a>{name}</a>}
                avatar={
                    <Avatar alt={name} className={"postAvatar"} size="default" style={{
                        backgroundColor: "#f56a00",
                        verticalAlign: 'middle',
                        fontSize: '17px'
                    }}>
                        {JSON.stringify(name).charAt(1).toUpperCase()}
                    </Avatar>
                } content={
                <p>
                    {reply.reply_data}
                </p>
            }
            >
                {printProfileReplys(reply.replyId)}
            </Comment>)
        }
    }
    return <div>{print}</div>;
}

export {
    getReplys,
    createReply,
    getPosts,
    printProfilePost,
    printPost,
    createPost,
    getUserName,
    deleteAccount,
    changeEmail,
    changeName,
    getEmail,
    getJoinDate,
    initUsers,
    verifyUser,
    getUser,
    removeUser,
    createUsers,
    setMFA,
    getMFA,
    getMFAStatus,
    verifyMFAAnswer,
    setUser
}
