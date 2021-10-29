import React from 'react';
import {Row, Col, Divider, message, Card, Button, Table, Modal, Tooltip, Switch} from 'antd';
import BreadcrumbCustom from '../../Components/BreadcrumbCustom';
import {bindActionCreators} from "redux";
import {receiveData} from "../../../action";
import {connect} from "react-redux";
import {getBulletin, setBulletin, updateBulletin, delBulletinById} from "../../../axios";
import {Form} from "antd/lib/index";
import BulletinAddDialog from "./BulletinAddDialog";
import BulletinModifyDialog from "./BulletinModifyDialog";

class BulletinSetting extends React.Component {
    state = {}

    componentDidMount() {
        this.fetch();
    }

    fetch = () => {
        getBulletin().then((data) => {
            if (data && data.code == 200) {
                this.setState({bulletin: data.data});
                if (data.data && data.data.length) {
                    data.data.forEach(res => {
                        if (res.content == "升级维护中" || res.content == "因政策调整，iOS支付暂不可用") {
                            this.setState({weiHuCheck: true})
                        } else {
                            this.setState({weiHuCheck: false})
                        }
                    })
                } else {
                    this.setState({weiHuCheck: false})
                }
            } else {
                message.error('获取系统配置失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }
    refresh = () => {
        this.fetch();
    }
    deleteBullet = () => {
        delBulletinById({id: this.state.record.id}).then((data) => {
            this.setState({deleteVisible: false, dialogModifyVisible: false});
            if (data && data.code == 200) {
                if (data.data) {
                    this.refresh();
                    message.success('删除成功', 1);
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('删除失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    };
    onNameClick = (record, e) => {
        this.setState({record: record});
        this.showBulletinModifyDialog();
    }
    saveBulletinAddDialogRef = (form) => {
        this.formAdd = form;
    }
    saveBulletinModifyDialogRef = (form) => {
        this.formModify = form;
    }
    showBulletinAddDialog = () => {
        this.setState({dialogAddVisible: true});
    };
    handleBulletinAddCancel = () => {
        this.setState({dialogAddVisible: false});
    };
    showBulletinModifyDialog = () => {
        this.setState({dialogModifyVisible: true});
    };
    handleBulletinModifyCancel = () => {
        this.setState({dialogModifyVisible: false});
    };
    handleBulletinAddCreate = () => {
        const form = this.formAdd;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            setBulletin(values).then((data) => {
                if (data && data.code == 200) {
                    if (data.data) {
                        this.refresh();
                        message.success('添加成功', 1);
                    }
                } else {
                    message.error('添加失败：' + (data ? data.code + ":" + data.message : data), 3);
                }
            });
            form.resetFields();
            this.setState({dialogAddVisible: false});
        });
    };
    handleBulletinModifyCreate = () => {
        const form = this.formModify;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            updateBulletin(values).then((data) => {
                if (data && data.code == 200) {
                    if (data.data) {
                        this.refresh();
                        message.success('修改成功', 1);
                    }
                } else {
                    message.error('修改失败：' + (data ? data.code + ":" + data.message : data), 3);
                }
            });
            form.resetFields();
            this.setState({dialogModifyVisible: false});
        });
    };
    handleBulletinDelete = () => {
        this.setState({deleteVisible: true,});
    }
    handleDeleteCancel = () => {
        this.setState({deleteVisible: false});
    }
    onWeiHuCheckClick = (e) => {
        if (e) {
            setBulletin({
                areaType: 0,
                content: "因政策调整，iOS支付暂不可用",
                curtain: false,
                type: "page",
                wechatType: 0
            }).then((data) => {
                if (data && data.code == 200) {
                    if (data.data) {
                        this.refresh();
                        // this.setState({weiHuCheck: e});
                        message.success('修改成功', 1);
                    }
                } else {
                    message.error('修改失败：' + (data ? data.code + ":" + data.message : data), 3);
                }
            });
        } else {
            if (this.state.bulletin && this.state.bulletin.length) {
                this.state.bulletin.forEach(res => {
                    if (res.content == "升级维护中" || res.content == "因政策调整，iOS支付暂不可用") {
                        delBulletinById({id: res.id}).then((data) => {
                            if (data && data.code == 200) {
                                if (data.data) {
                                    this.refresh();
                                    message.success('修改成功', 1);
                                } else {
                                    message.warn(data.message, 1);
                                }
                            } else {
                                message.error('修改失败：' + (data ? data.code + ":" + data.message : data), 3);
                            }
                        });
                    }
                })
            }
        }

    }

    render() {
        const AddDialog = Form.create()(BulletinAddDialog);
        const ModifyDialog = Form.create()(BulletinModifyDialog);

        const isMobile = this.props.responsive.data.isMobile;

        const columns = [{
            title: '内容',
            key: 'content',
            dataIndex: 'content',
            width: '40%',
            align: 'center',
            render: function (text, record, index) {
                if (record.curtain) {
                    return <span>图片</span>
                }
                return <span>{record.content}</span>
            }
        }, {
            title: '链接',
            dataIndex: 'url',
            key: 'url',
            width: '8%',
            align: 'center',
            render: function (text, record, index) {
                return <Tooltip title={record.url}><span>查看</span></Tooltip>
            }
        }, {
            title: '类型',
            dataIndex: 'curtain',
            key: 'curtain',
            width: '12%',
            align: 'center',
            render: function (text, record, index) {
                let sceneString = ""
                const sceneType = record.sceneType;
                if (sceneType == "home") {
                    sceneString = "-首页";
                } else if (sceneType == "league") {
                    sceneString = "-联赛";
                } else if (sceneType == "match") {
                    sceneString = "-比赛";
                }
                if (record.curtain) {
                    return <span>广告牌{sceneString}</span>
                }
                return <span>公告栏{sceneString}</span>
            }
        }, {
            title: '跳转类型',
            dataIndex: 'type',
            key: 'type',
            width: '10%',
            align: 'center',
            render: function (text, record, index) {
                if (record.type == 'website') {
                    return <span>网站</span>
                }
                if (record.type == 'page') {
                    return <span>页面</span>
                }
                return <span>页面</span>
            }
        }, {
            title: '省份',
            dataIndex: 'province',
            key: 'province',
            width: '10%',
            align: 'center',
        }, {
            title: '地区类型',
            dataIndex: 'areaType',
            key: 'areaType',
            width: '10%',
            align: 'center',
            render: function (text, record, index) {
                let area = "默认";
                if (record.areaType) {
                    switch (record.areaType) {
                        case 0:
                            area = "默认";
                            break;
                        case 1:
                            area = "全国";
                            break;
                    }
                }
                return <span>{area}</span>
            }
        }, {
            title: '微信类型',
            dataIndex: 'wechatType',
            key: 'wechatType',
            width: '10%',
            align: 'center',
            render: function (text, record, index) {
                let type = "1元体育";
                if (record.wechatType) {
                    switch (record.wechatType) {
                        case 0:
                            type = "1元体育";
                            break;
                        case 1:
                            type = "青少年";
                            break;
                    }
                }
                return <span>{type}</span>
            }
        }];
        return (
            <div>
                <BreadcrumbCustom first="系统设置"/>
                <Divider>公告设置</Divider>
                <Card bordered={false}>
                    <Table columns={columns}
                           onRow={record => ({onClick: this.onNameClick.bind(this, record)})}
                           rowKey={record => record.id}
                           dataSource={this.state.bulletin}
                           loading={this.state.loading}
                           bordered
                           title={() =>
                               <div className="clearfix">
                                   <div className="inline-block">
                                       <Tooltip title="添加">
                                           <Button type="primary"
                                                   shape="circle"
                                                   icon="plus"
                                                   onClick={this.showBulletinAddDialog}/>
                                       </Tooltip>
                                       <span className="ml-l">iOS支付维护通告：</span>
                                       <Switch checked={this.state.weiHuCheck} onClick={this.onWeiHuCheckClick}/>
                                   </div>
                                   <Tooltip title="刷新">
                                       <Button type="primary"
                                               shape="circle"
                                               icon="reload"
                                               className="pull-right"
                                               loading={this.state.loading}
                                               onClick={this.refresh}/>
                                   </Tooltip>
                               </div>
                           }
                    />
                </Card>
                <Modal
                    className={isMobile ? "top-n" : ""}
                    title="添加公告"
                    visible={this.state.dialogAddVisible}
                    footer={[
                        <Button key="back" onClick={this.handleBulletinAddCancel}>取消</Button>,
                        <Button key="submit" type="primary" onClick={this.handleBulletinAddCreate}>确定</Button>,
                    ]}
                    onCancel={this.handleBulletinAddCancel}>
                    <AddDialog visible={this.state.dialogAddVisible}
                               ref={this.saveBulletinAddDialogRef}/>
                </Modal>
                <Modal
                    className={isMobile ? "top-n" : ""}
                    title="编辑公告"
                    visible={this.state.dialogModifyVisible}
                    footer={[
                        <Button key="back" onClick={this.handleBulletinModifyCancel}>取消</Button>,
                        <Button key="delete" type="danger" className="pull-left"
                                onClick={this.handleBulletinDelete}>删除</Button>,
                        <Button key="submit" type="primary" onClick={this.handleBulletinModifyCreate}>确定</Button>,
                    ]}
                    onCancel={this.handleBulletinModifyCancel}>
                    <ModifyDialog visible={this.state.dialogModifyVisible}
                                  ref={this.saveBulletinModifyDialogRef}
                                  record={this.state.record}/>
                </Modal>
                <Modal
                    className={isMobile ? "top-n" : ""}
                    title="确认删除"
                    visible={this.state.deleteVisible}
                    onOk={this.deleteBullet}
                    onCancel={this.handleDeleteCancel}
                    zIndex={1001}
                >
                    <p className="mb-n" style={{fontSize: 14}}>是否确认删除？</p>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {auth = {data: {}}, responsive = {data: {}}} = state.httpData;
    return {auth, responsive};
};
const mapDispatchToProps = dispatch => ({
    receiveData: bindActionCreators(receiveData, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(BulletinSetting);