import React from 'react';
import {Table, Input, Button, Icon, Modal, Tooltip, Radio} from 'antd';
import {getAllLeagueMatchSeries, getLeagueMatchById, getwxacodeunlimit} from '../../../axios/index';
import {getQueryString, mergeJSON} from '../../../utils/index';
import {Avatar} from 'antd';
import {delLeagueMatchByIds, updateLeagueMatchById, createLeagueMatch} from "../../../axios";
import {Form, message} from "antd/lib/index";
import OneyuanLeagueMatchAddDialog from "./OneyuanLeagueMatchAddDialog"
import OneyuanLeagueMatchModifyDialog from "./OneyuanLeagueMatchModifyDialog"
import {parseTimeStringYMD} from "../../../utils";
import defultAvatar from '../../../static/avatar.jpg';
import {bindActionCreators} from "redux";
import {receiveData} from "../../../action";
import {connect} from "react-redux";
import {Link} from 'react-router-dom';
import copy from 'copy-to-clipboard';

import {Base64} from 'js-base64';

class OneyuanLeagueMatchTable extends React.Component {
    state = {
        data: [],
        pagination: {pageSize: 10, filters: {}},
        loading: false,
        filterDropdownVisible: false,
        searchText: '',
        filtered: false,
        filterOrder: "createTime",
        selectedRowKeys: [],
        dialogModifyVisible: false,
        dialogAddVisible: false,
        record: {},
    };

    componentDidMount() {
        this.fetch({
            pageSize: this.state.pagination.pageSize,
            pageNum: this.props.page ? this.props.page : 1,
            sortOrder: "desc",
            sortField: "createTime"
        });
    };

    fetch = (params = {}) => {
        this.setState({loading: true});
        getAllLeagueMatchSeries(params).then((data) => {
            if (data && data.code == 200) {
                const pagination = {...this.state.pagination};
                pagination.total = data.data ? data.data.total : 0;
                pagination.current = data.data ? data.data.current : 1;
                pagination.sortOrder = params.sortOrder;
                pagination.sortField = params.sortField;
                this.setState({
                    loading: false,
                    data: data.data ? data.data.records : "",
                    pagination,
                    selectedRowKeys: [],
                });
            } else {
                message.error('获取联赛列表失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    }
    refresh = () => {
        const pager = {...this.state.pagination};
        this.fetch({
            pageSize: pager.pageSize,
            pageNum: pager.current,
            sortField: pager.sortField,
            sortOrder: pager.sortOrder,
            ...pager.filters,
        });
    }
    deleteMultiple = () => {
        delLeagueMatchByIds({id: this.state.selectedRowKeys}).then((data) => {
            this.setState({deleteVisible: false});
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
    deleteOne = () => {
        delLeagueMatchByIds({id: [this.state.record.id]}).then((data) => {
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
        ;
    }
    onInputChange = (e) => {
        this.setState({searchText: e.target.value});
    }
    onSearch = () => {
        const {searchText} = this.state;
        const pager = {...this.state.pagination};
        pager.filters = this.getTableFilters(pager);
        pager.current = 1;
        this.setState({
            filterDropdownVisible: false,
            filtered: !!searchText,
            pagination: pager,
        });
        this.fetch({
            pageSize: pager.pageSize,
            pageNum: 1,
            sortField: pager.sortField,
            sortOrder: pager.sortOrder,
            ...pager.filters,
        });
    }
    onSelectChange = (selectedRowKeys) => {
        this.setState({selectedRowKeys});
    }
    onNameClick = (record, e) => {
        this.setState({record: record});
        this.showLeagueMatchModifyDialog();
    };
    handleTableChange = (pagination, filters, sorter) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        // pager.sortField = sorter.field;
        // pager.sortOrder = sorter.order == "descend" ? "desc" : sorter.order == "ascend" ? "asc" : "";
        pager.filters = this.getTableFilters(pager, filters);
        this.props.switchPage(pager.current);
        this.setState({
            pagination: pager,
        });
        this.fetch({
            pageSize: pager.pageSize,
            pageNum: pager.current,
            sortField: pager.sortField,
            sortOrder: pager.sortOrder,
            ...pager.filters,
        });
    }
    getTableFilters = (pager, filters) => {
        const {searchText, filterOrder} = this.state;
        pager.filters = {};
        if (searchText != null && searchText != '') {
            pager.filters["name"] = searchText;
        }
        if (filterOrder != null) {
            pager.sortField = filterOrder;
        }
        if (filters) {
            for (let param in filters) {
                if (filters[param] != null && (filters[param] instanceof Array && filters[param].length > 0)) {
                    pager.filters[param] = filters[param][0];
                }
            }
        }
        return pager.filters;
    }
    saveLeagueMatchDialogRef = (form) => {
        this.formAdd = form;
    };
    saveLeagueMatchModifyDialogRef = (form) => {
        this.formModify = form;
    };
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
                        this.refresh();
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
                        this.refresh();
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
    handleLeagueDelete = () => {
        this.setState({
            deleteVisible: true,
            handleDeleteOK: this.deleteOne,
            deleteCols: 1,
        });
    }
    handleLeaguesDelete = () => {
        this.setState({
            deleteVisible: true,
            handleDeleteOK: this.deleteMultiple,
            deleteCols: this.state.selectedRowKeys ? this.state.selectedRowKeys.length : 0,
        })
    }
    handleDeleteCancel = () => {
        this.setState({deleteVisible: false});
    }
    getModifyFooter = (record) => {
        if (record && record.isParent) {
            return [
                <Button key="view" type="primary" className="pull-left">
                    <Link to={
                        `/oneyuan/oneyuanLeagueSeries/${this.state.record.id}`
                    }>浏览联赛</Link>
                </Button>,
                <Button key="delete" type="danger" className="pull-left"
                        onClick={this.handleLeagueDelete}>删除</Button>,
                <Button key="back" onClick={this.handleLeagueMatchModifyCancel}>取消</Button>,
                <Button key="submit" type="primary" onClick={this.handleLeagueMatchModifyCreate}>
                    确定
                </Button>
            ]
        }
        return [
            <Button key="battle" type="primary" className="pull-left">
                <Link to={
                    `/oneyuan/oneyuanLeagueMatch/${this.state.record.id}`
                }>战报积分榜设置</Link>
            </Button>,
            <Button key="detail" type="primary" className="pull-left"><Link to={
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
            // <Button key="back" onClick={this.handleLeagueMatchModifyCancel}>取消</Button>,
            <Button key="submit" type="primary" onClick={this.handleLeagueMatchModifyCreate}>
                确定
            </Button>
        ]
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
    onOrderDropDownRadioChange = (e) => {
        this.setState({
            filterOrder: e.target.value,
        });
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
        const onNameClick = this.onNameClick;
        const genWxaCode = this.genWxaCode;
        const {selectedRowKeys} = this.state;
        const AddDialog = Form.create()(OneyuanLeagueMatchAddDialog);
        const ModifyDialog = Form.create()(OneyuanLeagueMatchModifyDialog);

        const isMobile = this.props.responsive.data.isMobile;

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
            filterDropdown: (
                <div className="custom-filter-dropdown">
                    <Input
                        ref={ele => this.searchInput = ele}
                        xplaceholder="Search name"
                        value={this.state.searchText}
                        onChange={this.onInputChange}
                        onPressEnter={this.onSearch}
                    />
                    <Button type="primary" icon="search" onClick={this.onSearch}>查找</Button>
                </div>
            ),
            filterIcon: <Icon type="search" style={{color: this.state.filtered ? '#108ee9' : '#aaa'}}/>,
            filterDropdownVisible: this.state.filterDropdownVisible,
            onFilterDropdownVisibleChange: (visible) => {
                this.setState({
                    filterDropdownVisible: visible,
                }, () => this.searchInput && this.searchInput.focus());
            },
            width: '30%',
            render: function (text, record, index) {
                return <div className="cursor-hand" onClick={onNameClick.bind(this, record)}>
                    <div className={`center ${record.shortName ? "border-bottom-gray" : ""}`}><Avatar
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
        }, {
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
                return <p>{record.province ? record.province : "-"}/{record.city ? record.city : "-"}</p>
            }
        }, {
            title: '时间',
            align: 'center',
            dataIndex: 'dateBegin',
            width: '15%',
            render: function (text, record, index) {
                return <span>{(record.dateBegin ? parseTimeStringYMD(record.dateBegin) : "-") + "~" + (record.dateEnd ? parseTimeStringYMD(record.dateEnd) : "-")}</span>
            }
        }, {
            title: '地区类型',
            dataIndex: 'areaType',
            key: 'areaType',
            width: '7%',
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
            width: '7%',
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
            filterDropdown: (
                <div className="custom-filter-dropdown">
                    <div className="custom-filter-dropdown-radio">
                        <Radio.Group onChange={this.onOrderDropDownRadioChange} value={this.state.filterOrder}>
                            <Radio value={"createTime"}>按创建时间</Radio>
                            <Radio value={"sortIndex"}>按排序</Radio>
                        </Radio.Group>
                    </div>
                    <div className="w-full center mt-s">
                        <Button type="primary" icon="search" onClick={this.onSearch}>查找</Button>
                    </div>
                </div>
            ),
            filterIcon: <Icon type="filter" style={{color: this.state.filterOrder ? '#108ee9' : '#aaa'}}/>,
            filterDropdownVisible: this.state.filterOrderDropdownVisible,
            onFilterDropdownVisibleChange: (visible) => {
                this.setState({
                    filterOrderDropdownVisible: visible,
                });
            },
        }, {
            title: <span>轮播id</span>,
            align: 'center',
            width: '5%',
            render: function (text, record, index) {
                return <p className="cursor-hand" onClick={() => {
                    let leagueBanner = `../leagueManager/leagueManager?id=${record.id}`
                    if(record.isParent){
                        leagueBanner = `../series/series?id=${record.id}`
                    }
                    copy(leagueBanner);
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
            width: '4%',
            render: function (text, record, index) {
                if (record.isparent) {
                    return <span onClick={() => {
                        message.warn("请前往系列赛中查看", 1);
                    }
                    } className="cursor-hand">查看</span>
                }
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
            filterDropdown: (
                <div className="custom-filter-dropdown">
                    <Input
                        ref={ele => this.searchInput = ele}
                        placeholder="Search name"
                        value={this.state.searchText}
                        onChange={this.onInputChange}
                        onPressEnter={this.onSearch}
                    />
                    <Button type="primary" icon="search" onClick={this.onSearch}>查找</Button>
                </div>
            ),
            filterIcon: <Icon type="search" style={{color: this.state.filtered ? '#108ee9' : '#aaa'}}/>,
            filterDropdownVisible: this.state.filterDropdownVisible,
            onFilterDropdownVisibleChange: (visible) => {
                this.setState({
                    filterDropdownVisible: visible,
                }, () => this.searchInput && this.searchInput.focus());
            },
            width: '100%',
            render: function (text, record, index) {
                return <div className="center"><Avatar src={record.headImg ? record.headImg : defultAvatar}/>
                    <p className="ml-s cursor-hand"
                       onClick={onNameClick.bind(this, record)}>{record.name}{record.shortName ? "(" + record.shortName + ")" : ""}</p>
                </div>;
            },
        }
        ];
        return <div><Table columns={isMobile ? columns_mobile : columns}
                           rowKey={record => record.id}
                           rowSelection={isMobile ? null : rowSelection}
                           dataSource={this.state.data}
                           pagination={this.state.pagination}
                           loading={this.state.loading}
                           onChange={this.handleTableChange}
                           bordered
                           size="small"
                           title={() =>
                               <div>
                                   <Tooltip title="添加">
                                       <Button type="primary" shape="circle" icon="plus"
                                               onClick={this.showLeagueMatchAddDialog}/>
                                   </Tooltip>
                                   <Tooltip title="删除">
                                       <Button type="danger" shape="circle" icon="delete"
                                               hidden={this.state.selectedRowKeys.length > 0 ? false : true}
                                               onClick={this.handleLeaguesDelete}>{selectedRowKeys.length}
                                       </Button>
                                   </Tooltip>
                                   <Tooltip title="导出热度pk网页链接">
                                       <Button type="primary" shape="circle" icon="export"
                                               hidden={this.state.selectedRowKeys.length > 0 ? false : true}
                                               onClick={this.handleExportHeatWebPage}>{selectedRowKeys.length}
                                       </Button>
                                   </Tooltip>
                                   <Tooltip title="刷新">
                                       <Button type="primary" shape="circle" icon="reload" className="pull-right"
                                               loading={this.state.loading}
                                               onClick={this.refresh}/>
                                   </Tooltip>
                               </div>
                           }
        />
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
                footer={this.getModifyFooter(this.state.record)}
            >
                <ModifyDialog
                    visible={this.state.dialogModifyVisible}
                    ref={this.saveLeagueMatchModifyDialogRef}
                    record={this.state.record}/>
            </Modal>
            <Modal
                key="dialog-delete"
                className={isMobile ? "top-n" : ""}
                title="确认删除"
                visible={this.state.deleteVisible}
                onOk={this.state.handleDeleteOK}
                onCancel={this.handleDeleteCancel}
                zIndex={1001}
            >
                <p style={{fontSize: 14}}>是否确认删除{this.state.deleteCols}条数据？</p>
                <p className="mb-n text-danger">注意：删除联赛将删除联赛所有比赛数据！！！</p>
            </Modal>
        </div>
    }
}

const mapStateToProps = state => {
    const {auth = {data: {}}, responsive = {data: {}}} = state.httpData;
    return {auth, responsive};
};
const mapDispatchToProps = dispatch => ({
    receiveData: bindActionCreators(receiveData, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanLeagueMatchTable);