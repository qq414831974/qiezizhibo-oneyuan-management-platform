import React from 'react';
import {Row, Col, Card, Button, Table, Avatar, Modal, Tooltip} from 'antd';
import BreadcrumbCustom from '../../../Components/BreadcrumbCustom';
import {
    getLeagueInfoBySeriesId,
    addLeagueIntoSeries,
    removeLeagueIntoSeries,
    getNoSeriesLeague,
    createLeagueMatch, updateLeagueMatchById,
    getLeagueMatchById, delLeagueMatchByIds, getwxacodeunlimit, chargeAllMatchByLeagueId,
} from "../../../../axios";
import {parseTimeStringYMD} from "../../../../utils";
import copy from "copy-to-clipboard/index";
import {Form, message} from "antd/lib/index";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {receiveData} from "../../../../action";
import defultAvatar from '../../../../static/avatar.jpg';
import OneyuanLeagueMatchModifyDialog from "./OneyuanLeagueSeriesModifyDialog";
import OneyuanLeagueMatchAddDialog from "./OneyuanLeagueSeriesAddDialog";
import {Link} from 'react-router-dom';
import OneyuanLeagueSeriesAddLeagueDialog from "./OneyuanLeagueSeriesAddLeagueDialog";
import {Base64} from 'js-base64';

class OneyuanLeagueMatchSeriesManagement extends React.Component {
    state = {
        data: [],
        record: {},
        leagueData: {},
        selectedRowKeys: [],
    }

    componentDidMount() {
        if (!(this.props.match.params && this.props.match.params.id)) {
            return;
        }
        this.fetch();
    }

    fetch = () => {
        this.setState({loading: true})
        getLeagueInfoBySeriesId({pageSize: 100, pageNum: 1, seriesId: this.props.match.params.id}).then(data => {
            if (data && data.code == 200) {
                this.setState({
                    loading: false,
                    data: data.data.records,
                    selectedRowKeys: [],
                });
            }
        })
        getLeagueMatchById(this.props.match.params.id).then(data => {
            if (data && data.code == 200) {
                this.setState({
                    leagueData: data.data,
                });
            }
        })
    }
    onSelectChange = (selectedRowKeys) => {
        this.setState({selectedRowKeys});
    }
    onNameClick = (record, e) => {
        this.setState({record: record});
        this.showLeagueMatchModifyDialog();
    };
    saveLeagueMatchDialogRef = (form) => {
        this.formAdd = form;
    };
    saveLeagueMatchModifyDialogRef = (form) => {
        this.formModify = form;
    };
    saveAddLeagueDialogRef = (form) => {
        this.formAddLeague = form;
    }
    showLeagueMatchAddDialog = () => {
        this.setState({dialogAddVisible: true});
    };
    showLeagueMatchModifyDialog = () => {
        this.setState({dialogModifyVisible: true});
    };
    handleLeagueMatchAddCancel = () => {
        this.setState({dialogAddVisible: false});
    };
    handleLeagueMatchModifyCancel = () => {
        this.setState({dialogModifyVisible: false});
    };
    handleLeagueMatchAddCreate = () => {
        const form = this.formAdd;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            values["dateBegin"] = values["dateBegin"] ? values["dateBegin"].format('YYYY/MM/DD HH:mm:ss') : null;
            values["dateEnd"] = values["dateEnd"] ? values["dateEnd"].format('YYYY/MM/DD HH:mm:ss') : null;
            createLeagueMatch(values).then((data) => {
                if (data && data.code == 200) {
                    if (data.data) {
                        this.fetch();
                        message.success('添加成功', 1);
                    } else {
                        message.warn(data.message, 1);
                    }
                } else {
                    message.error('添加失败：' + (data ? data.code + ":" + data.message : data), 3);
                }
            });
            form.resetFields();
            this.setState({dialogAddVisible: false});
        });
    };
    handleLeagueMatchModifyCreate = () => {
        const form = this.formModify;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            values["dateBegin"] = values["dateBegin"] ? values["dateBegin"].format('YYYY/MM/DD HH:mm:ss') : null;
            values["dateEnd"] = values["dateEnd"] ? values["dateEnd"].format('YYYY/MM/DD HH:mm:ss') : null;
            updateLeagueMatchById(values).then((data) => {
                if (data && data.code == 200) {
                    if (data.data) {
                        this.fetch();
                        message.success('修改成功', 1);
                    } else {
                        message.warn(data.message, 1);
                    }
                } else {
                    message.error('修改失败：' + (data ? data.code + ":" + data.message : data), 3);
                }
            });
            form.resetFields();
            this.setState({dialogModifyVisible: false});
        });
    };
    handleAddLeagueOK = () => {
        const form = this.formAddLeague;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            addLeagueIntoSeries(values).then((data) => {
                if (data && data.code == 200) {
                    if (data.data) {
                        this.fetch();
                        message.success('添加成功', 1);
                    } else {
                        message.warn(data.message, 1);
                    }
                } else {
                    message.error('添加失败：' + (data ? data.code + ":" + data.message : data), 3);
                }
            });
            form.resetFields();
            this.setState({dialogAddSeriesVisible: false});
        });
    }
    deleteRecord = () => {
        delLeagueMatchByIds({id: [this.state.record.id]}).then((data) => {
            this.setState({deleteVisible: false, dialogModifyVisible: false});
            if (data && data.code == 200) {
                if (data.data) {
                    this.fetch();
                    message.success('删除成功', 1);
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('删除失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    }
    removeRecord = () => {
        removeLeagueIntoSeries({leagueId: this.state.record.id, parentId: this.state.record.parentId}).then(data => {
            this.setState({deleteVisible: false, dialogModifyVisible: false});
            if (data && data.code == 200) {
                if (data.data) {
                    this.fetch();
                    message.success('删除成功', 1);
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('删除失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    }
    handleLeagueDelete = () => {
        this.setState({deleteVisible: true, deleteType: "league"});
    }
    handleLeagueSeriesDelete = () => {
        this.setState({deleteVisible: true, deleteType: "series"});
    }
    handleDeleteCancel = () => {
        this.setState({deleteVisible: false});
    }
    showLeagueSeriesAddDialog = () => {
        this.setState({dialogAddSeriesVisible: true});
    }
    hideLeagueSeriesAddDialog = () => {
        this.setState({dialogAddSeriesVisible: false});
    }
    handleDeleteOK = () => {
        if (this.state.deleteType === "league") {
            this.deleteRecord();
        } else if (this.state.deleteType === "series") {
            this.removeRecord();
        }
    }
    genWxaCode = (record) => {
        let page;
        if (record.isParent) {
            page = "series"
        } else {
            page = "leagueManager"
        }
        getwxacodeunlimit({page: "pages/home/home", scene: `page=${page}&id=${record.id}`}).then(data => {
            this.downloadBase64(`小程序码-联赛-${record.id}.jpg`, `data:image/png;base64,${data}`)
        })
    }
    download = (name, data) => {
        const urlObject = window.URL || window.webkitURL || window;
        const downloadData = new Blob([data]);
        const save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
        save_link.href = urlObject.createObjectURL(downloadData);
        save_link.download = name;
        this.fake_click(save_link);
    }
    downloadBase64 = (name, data) => {
        const save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
        save_link.href = data;
        save_link.download = name;
        this.fake_click(save_link);
    }
    fake_click = (obj) => {
        const ev = document.createEvent("MouseEvents");
        ev.initMouseEvent(
            "click", true, false, window, 0, 0, 0, 0, 0
            , false, false, false, false, 0, null
        );
        obj.dispatchEvent(ev);
    }
    handleExportHeatWebPage = () => {
        if (this.state.selectedRowKeys) {
            let content = "";
            for (let id of this.state.selectedRowKeys) {
                for (let leaguedata of this.state.data) {
                    if (leaguedata && leaguedata.id == id && !leaguedata.isParent) {
                        content = content + `${leaguedata.name}\r\n${"https://qiezitv.net/#" + Base64.encode(leaguedata.id)}\r\n\r\n`;
                    }
                }
            }
            this.download("热度PK网页导出.txt", content);
        }
    }

    render() {
        const isMobile = this.props.responsive.data.isMobile;
        const onNameClick = this.onNameClick;
        const genWxaCode = this.genWxaCode;
        const AddDialog = Form.create()(OneyuanLeagueMatchAddDialog);
        const ModifyDialog = Form.create()(OneyuanLeagueMatchModifyDialog);
        const AddLeagueDialog = Form.create()(OneyuanLeagueSeriesAddLeagueDialog);
        const {selectedRowKeys} = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
            hideDefaultSelections: true,
            selections: [{
                key: 'disSelect',
                text: '清空选中',
                onSelect: () => {
                    this.setState({selectedRowKeys: []});
                },
            }],
            onSelection: this.onSelection,
        };
        const columns = [{
            title: '名字',
            align: 'center',
            dataIndex: 'name',
            width: '30%',
            render: function (text, record, index) {
                return <div className="cursor-hand" onClick={onNameClick.bind(this, record)}>
                    <div className="center border-bottom-gray"><Avatar
                        src={record.headImg ? record.headImg : defultAvatar}/>
                        <p className="ml-s">{record.name}</p>
                    </div>
                    {record.shortName ? <div className="center">简称：{record.shortName}</div> : null}
                </div>;
            },
        }, {
            title: '类型',
            align: 'center',
            dataIndex: 'isParent',
            width: '5%',
            render: function (text, record, index) {
                let type = "联赛";
                if (record.isParent) {
                    type = "系列赛";
                } else if (record.type == 1) {
                    type = "杯赛";
                } else if (record.type == 2) {
                    type = "联赛";
                }
                return <span>{type}</span>
            }
        },  {
            title: '规则类型',
            align: 'center',
            dataIndex: 'ruleType',
            width: '5%',
            render: function (text, record, index) {
                let type = "5x5";
                if (record.ruleType == 1) {
                    type = "小篮比赛";
                } else if (record.ruleType == 2) {
                    type = "1x1";
                } else if (record.ruleType == 3) {
                    type = "3x3";
                }else if (record.ruleType == 4) {
                    type = "5x5";
                }
                return <span>{type}</span>
            }
        }, {
            title: '城市',
            align: 'center',
            dataIndex: 'country',
            width: '10%',
            render: function (text, record, index) {
                return <p>{record.country ? record.country : "-"}/{record.city ? record.city : "-"}</p>
            }
        }, {
            title: '时间',
            align: 'center',
            dataIndex: 'dateBegin',
            width: '10%',
            render: function (text, record, index) {
                return <span>{(record.dateBegin ? parseTimeStringYMD(record.dateBegin) : "-") + "~" + (record.dateEnd ? parseTimeStringYMD(record.dateEnd) : "-")}</span>
            }
        }, {
            title: '地区类型',
            dataIndex: 'areaType',
            key: 'areaType',
            width: '5%',
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
        }, , {
            title: '微信类型',
            dataIndex: 'wechatType',
            key: 'wechatType',
            width: '5%',
            align: 'center',
            render: function (text, record, index) {
                let type = "一元体育";
                if (record.wechatType) {
                    switch (record.wechatType) {
                        case 0:
                            type = "一元体育";
                            break;
                        case 1:
                            type = "青少年";
                            break;
                    }
                }
                return <span>{type}</span>
            }
        }, {
            title: <Tooltip title="数字越大排名越前面"><span>排序</span></Tooltip>,
            align: 'center',
            dataIndex: 'sortIndex',
            width: '10%',
        }, {
            title: <span>轮播id</span>,
            align: 'center',
            width: '5%',
            render: function (text, record, index) {
                return <p className="cursor-hand" onClick={() => {
                    copy(`../leagueManager/leagueManager?id=${record.id}`);
                    message.success('轮播链接已复制到剪贴板');
                }}>{record.id ? `${record.id}` : "-"}</p>
            }
        }, {
            title: "小程序码",
            align: 'center',
            width: '5%',
            render: function (text, record, index) {
                return <span onClick={genWxaCode.bind(this, record)}>生成</span>
            }
        }, {
            title: "收益",
            align: 'center',
            width: '5%',
            render: function (text, record, index) {
                return <Link to={
                    `/analysis/bill?leagueId=${record.id}`
                }><span className="cursor-hand">查看</span></Link>
            }
        },
        ];
        const columns_mobile = [{
            title: '名字',
            align: 'center',
            dataIndex: 'name',
            width: '100%',
            render: function (text, record, index) {
                return <div className="center"><Avatar src={record.headImg ? record.headImg : defultAvatar}/>
                    <p className="ml-s cursor-hand"
                       onClick={onNameClick.bind(this, record)}>{record.name}{record.shortName ? "(" + record.shortName + ")" : ""}</p>
                </div>;
            },
        }
        ];
        return (
            <div className="gutter-example">
                <BreadcrumbCustom first="比赛管理" second="系列赛"/>
                <Row gutter={16}>
                    <Col className="gutter-row">
                        <div className="gutter-box">
                            <Card bordered={false}>
                                <div className="w-full center">
                                    <div className="center purple-light pt-s pb-s pl-m pr-m border-radius-10px">
                                        <span>系列赛：</span>
                                        <Avatar
                                            src={this.state.leagueData.headImg ? this.state.leagueData.headImg : defultAvatar}/>
                                        <span
                                            className="ml-s">{this.state.leagueData.name}{this.state.leagueData.englishName ? "(" + this.state.leagueData.englishName + ")" : ""}</span>
                                    </div>
                                </div>
                                <Table columns={isMobile ? columns_mobile : columns}
                                       rowKey={record => record.id}
                                       rowSelection={isMobile ? null : rowSelection}
                                       dataSource={this.state.data}
                                       loading={this.state.loading}
                                       bordered
                                       size="small"
                                       className="mt-m"
                                       title={() =>
                                           <div>
                                               <Button type="primary" shape="circle" icon="plus"
                                                       onClick={this.showLeagueMatchAddDialog}/>
                                               <Button type="primary" shape="circle" icon="zoom-in"
                                                       onClick={this.showLeagueSeriesAddDialog}/>
                                               <Tooltip title="导出热度pk网页链接">
                                                   <Button type="primary" shape="circle" icon="export"
                                                           hidden={this.state.selectedRowKeys.length > 0 ? false : true}
                                                           onClick={this.handleExportHeatWebPage}>{selectedRowKeys.length}
                                                   </Button>
                                               </Tooltip>
                                               <Button type="primary" shape="circle" icon="reload"
                                                       className="pull-right"
                                                       loading={this.state.loading}
                                                       onClick={this.fetch}/>
                                           </div>
                                       }
                                />
                            </Card>
                        </div>
                    </Col>
                </Row>
                <Modal
                    key="dialog-add"
                    className={isMobile ? "top-n" : ""}
                    width={700}
                    visible={this.state.dialogAddVisible}
                    title="添加联赛"
                    okText="确定"
                    onCancel={this.handleLeagueMatchAddCancel}
                    destroyOnClose="true"
                    onOk={this.handleLeagueMatchAddCreate}
                >
                    <AddDialog
                        leagueData={this.state.leagueData}
                        visible={this.state.dialogAddVisible}
                        ref={this.saveLeagueMatchDialogRef}/>
                </Modal>
                <Modal
                    key="dialog-modify"
                    className={isMobile ? "top-n" : ""}
                    width={800}
                    visible={this.state.dialogModifyVisible}
                    title="编辑队伍"
                    okText="确定"
                    onCancel={this.handleLeagueMatchModifyCancel}
                    destroyOnClose="true"
                    onOk={this.handleLeagueMatchModifyCreate}
                    footer={[
                        <Button key="battle" type="primary" className="pull-left">
                            <Link to={
                                `/oneyuan/oneyuanLeagueMatch/${this.state.record.id}`
                            }>战报积分榜设置</Link>
                        </Button>,
                        <Button key="detail" type="primary" className="pull-left">
                            <Link to={
                                `/oneyuan/league/detail/${this.state.record.id}`
                            }>详细设置</Link>
                        </Button>,
                        <Button key="view" type="primary" className="pull-left">
                            <Link to={
                                `/oneyuan/oneyuanMatch?leagueId=${this.state.record.id}`
                            }>浏览比赛</Link>
                        </Button>,
                        <Button key="delete" type="danger" className="pull-left"
                                onClick={this.handleLeagueDelete}>删除</Button>,
                        <Button key="delete2" type="danger" className="pull-left"
                                onClick={this.handleLeagueSeriesDelete}>从系列赛移除</Button>,
                        // <Button key="back" onClick={this.handleLeagueMatchModifyCancel}>取消</Button>,
                        <Button key="submit" type="primary" onClick={this.handleLeagueMatchModifyCreate}>
                            确定
                        </Button>
                    ]}
                >
                    <ModifyDialog
                        visible={this.state.dialogModifyVisible}
                        ref={this.saveLeagueMatchModifyDialogRef}
                        leagueData={this.state.leagueData}
                        record={this.state.record}/>
                </Modal>
                <Modal
                    key="dialog-delete"
                    className={isMobile ? "top-n" : ""}
                    title="确认删除"
                    visible={this.state.deleteVisible}
                    onOk={this.handleDeleteOK}
                    onCancel={this.handleDeleteCancel}
                    zIndex={1001}
                >
                    <p style={{fontSize: 14}}>{this.state.deleteType === "league" ? "是否确认删除条数据？" : "是否移除？"}</p>
                    {this.state.deleteType === "league" ?
                        <p className="mb-n text-danger">注意：删除联赛将删除联赛所有比赛数据！！！</p> : null}
                </Modal>
                <Modal
                    className={isMobile ? "top-n" : ""}
                    title="添加联赛"
                    okText="确定"
                    visible={this.state.dialogAddSeriesVisible}
                    onOk={this.handleAddLeagueOK}
                    onCancel={this.hideLeagueSeriesAddDialog}
                    zIndex={1001}
                    destroyOnClose="true"
                >
                    <AddLeagueDialog
                        visible={this.state.dialogAddSeriesVisible}
                        record={this.state.leagueData}
                        ref={this.saveAddLeagueDialogRef}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanLeagueMatchSeriesManagement);