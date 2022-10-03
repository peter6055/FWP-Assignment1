import React, {useState} from 'react';
import {
    Avatar,
    Card,
    Comment,
    Image,
    Row,
    Col,
    Form,
    Input,
    Button,
    Upload,
    Modal,
    message,
    Spin
} from "antd";
import {PlusOutlined, LoadingOutlined} from '@ant-design/icons';
import $ from 'jquery';

import {getUserName, createPost, printPost, createReply} from "../data/repository";
import {upload} from "../data/aws";

// TODO ------------------------------------------------------------------------------------------
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// TODO ------------------------------------------------------------------------------------------


const {TextArea} = Input;
const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;


const Post = (props) => {
    const handleReplyOnClick = (e) => {
        var currentReplyInputDisplay = $(e.target).children().css("display")

        if(currentReplyInputDisplay == "none"){
            $(e.target).children().css({display: "inline"});

        } else if(currentReplyInputDisplay == "inline") {
            $(e.target).children().css({display: "none"});
        }
    };

    const handleReplySubmit = (e) => {


        {/*TODO -------------------------------------------------------------------------------*/}
        // this is text of post
        const text = $(e.target).closest('.reply-input-box').find('.ql-editor')[0].innerHTML;
        const text_length = $(e.target).closest('.reply-input-box').find('.ql-editor')[0].innerText.length;
        {/*TODO -------------------------------------------------------------------------------*/}

        // frocen: this a new way to detect word limit due to formatted text implementation
        if (text_length > 600 || !text){
            message.error({
                content: 'Reply message can not be empty or exceed 600 characters',
            });
            return
        }

        const parentId=$(e.target).closest(".ant-form-item").find('button').attr( "parentId");
        $(e.target).closest('.ant-comment-content-detail').find('textarea').val('').change();

        createReply(props.id, parentId, text);
        // successful msg
        message.success({
            content: 'Reply posted',
        });

        // after successful reply
        // hide reply input
        $(e.target).closest('replyinput').css({display: "none"});

        setPostData(printPost(handleReplySubmit, handleReplyOnClick));
    }


    const [Name, setName] = useState(getUserName(props.id));
    const [postsData, setPostData] = useState(printPost(handleReplySubmit, handleReplyOnClick));


    // ============================================================== Make Post ===============================
    const [value, setValue] = useState('');
    const MakePostElement = () => (
        <Card style={{width: "100%"}}>
            <Comment
                avatar={
                    <Avatar alt={getUserName(props.id)} className={"postAvatar"} size="default" style={{
                        backgroundColor: "#f56a00",
                        verticalAlign: 'middle',
                        fontSize: '17px'
                    }}>
                        {JSON.stringify(Name).charAt(1).toUpperCase()}
                    </Avatar>
                }
                content={
                    <div>
                        <Form.Item>
                            {/*TODO -------------------------------------------------------------------------------*/}
                            <ReactQuill id="postTextItem" theme="snow" placeholder={"Write a post..."}/>
                            {/*TODO -------------------------------------------------------------------------------*/}

                        </Form.Item>
                        <Form.Item>
                            <Upload
                                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                accept="image/*"
                                listType="picture-card"
                                fileList={fileList}
                                onPreview={handleFilePreview}
                                onChange={handleFileUpload}
                                onRemove={handleFileRemove}
                            >
                                {fileList.length >= 8 ? null :
                                    <div>
                                        <PlusOutlined/>
                                        <div style={{marginTop: 8,}}>Upload</div>
                                    </div>
                                }
                            </Upload>
                            <Spin indicator={loadingIcon} style={{display: "none"}} id={"upload-loading-spinner"} tip="Uploading..."/>
                            <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={handleCancel}>
                                <img
                                    alt="example"
                                    style={{
                                        width: '100%',
                                    }}
                                    src={previewImage}
                                />
                            </Modal>
                            <TextArea type={"hidden"} style={{display: "none"}} id="postImageItem" rows={4}/>
                        </Form.Item>
                        <Form.Item>
                            <Button htmlType="submit" onClick={handleSubmitPost} type="primary">Make a Post</Button>
                        </Form.Item>
                    </div>
                }
            >
            </Comment>
        </Card>
    );

    // upload file
    const [fileList, setFileList] = useState([]);
    let url;
    const handleFileUpload = (e) => {
        console.log(e);
        // display loading state, no using hook cuz re-rendering cause upload issue
        $("#upload-loading-spinner").css("display", "flex");

        let status = e.file.status;
        let event = e.event;
        let uid = e.file.uid;
        let name = e.file.name;
        let type = e.file.type;


        let fileExtension = type.replace(/(.*)\//g, '');
        let fileUploadName = uid + '.' + fileExtension;

        let reader = new FileReader();
        reader.readAsDataURL(e.file.originFileObj);

        // because render.onLoad will fire onChange three times
        // this is to push the images only in the first time
        if (status === "uploading" && event === undefined) {
            reader.onload = function (e) {

                var result = upload(fileUploadName, reader.result, type);

                if(result !== ""){

                    url = 'https://s3789585.s3.ap-southeast-2.amazonaws.com/fwp-a1/' + fileUploadName

                    setTimeout(function() {
                        fileList.push({"uid": uid, "name": name, "status": "done", "url": url})
                    }, 2500);

                } else {
                    alert("AWS upload promise issue");
                }

            }

        // error means end, cuz we are not handling upload official
        } else if(status === "error"){
            // when end, hide loading state
            $("#upload-loading-spinner").css("display", "none");

        }
    }

    // for preview modal (source: https://ant.design/components/upload/#onChange)
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('')
    const handleFilePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = file;
        }

        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };
    const handleCancel = () => setPreviewVisible(false);


    // remove file
    const [forceRefresh, setForceRefresh] = useState(0);
    const handleFileRemove = (e) => {
        let uid = e.uid;
        for (var count = 0; count < fileList.length; count++) {
            console.log(fileList[count]);

            if (fileList[count].uid === uid) {
                fileList.splice(count, 1);
            }
        }

        //force refresh to refresh the file list
        setForceRefresh(forceRefresh + 1);
    }


    // onclick make a post
    const handleSubmitPost = () => {

        {/*TODO -------------------------------------------------------------------------------*/}
        // this is text of post
        const text = document.getElementById("postTextItem").getElementsByTagName('div')[1].getElementsByClassName("ql-editor")[0].innerHTML;
        const text_length = document.getElementById("postTextItem").getElementsByTagName('div')[1].getElementsByClassName("ql-editor")[0].innerText.length;
        {/*TODO -------------------------------------------------------------------------------*/}


        // frocen: this a new way to detect word limit due to formatted text implementation
        if (text_length > 600 || !text){
            message.error({
                content: 'Post message can not be empty or exceed 600 characters',
            });
            return
        }

        createPost(props.id ,text, fileList);
        setPostData(printPost(handleReplySubmit, handleReplyOnClick));

        // successful msg
        message.success({
            content: 'Post successful',
        });

        // clear file list
        setFileList([]);
    };
    // ============================================================== Make Post ===============================

    return (
        <Row className={"profilePage safeArea"} style={{display: "flex", justifyContent: "center"}}>
            <Col span={24} style={{maxWidth: "1000px"}}>
                <div className={"postContainer"}>
                    <MakePostElement></MakePostElement>
                    {postsData}
                </div>
            </Col>
        </Row>
    );

}

export default Post;