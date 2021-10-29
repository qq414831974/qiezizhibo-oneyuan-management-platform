import React from 'react';
import {Table, Input, Button, Icon, Modal, Upload, Spin, Tooltip} from 'antd';
import {getAllTeams} from '../../../axios/index';
import {mergeJSON} from '../../../utils/index';
import {Avatar} from 'antd';
import {delTeamByIds, updateTeamById, createTeam, uploaddocx_team} from "../../../axios";
import {Form, message, notification} from "antd/lib/index";
import OneyuanTeamAddDialog from "./OneyuanTeamAddDialog"
import OneyuanTeamModifyDialog from "./OneyuanTeamModifyDialog"
import {parseTimeStringYMD} from "../../../utils";
import defultAvatar from '../../../static/avatar.jpg';
import {Link} from 'react-router-dom';
import {bindActionCreators} from "redux";
import {receiveData} from "../../../action";
import {connect} from "react-redux";
import copy from "copy-to-clipboard/index";

class OneyuanTeamTable extends React.Component {
    state = {
        data: [],
        pagination: {pageSize: 10, filters: {}},
        loading: false,
        filterDropdownVisible: false,
        searchText: '',
        filtered: false,
        selectedRowKeys: [],
        dialogModifyVisible: false,
        dialogAddVisible: false,
        record: {},
    };

    componentDidMount() {
        this.fetch({
            pageSize: this.state.pagination.pageSize,
            pageNum: 1,
        });
    };

    fetch = (params = {}) => {
        this.setState({loading: true});
        getAllTeams(params).then((data) => {
            if (data && data.code == 200) {
                const pagination = {...this.state.pagination};
                pagination.total = data.data ? data.data.total : 0;
                pagination.current = data.data ? data.data.current : 1;
                this.setState({
                    loading: false,
                    data: data.data ? data.data.records : "",
                    pagination,
                    selectedRowKeys: [],
                });
            } else {
                message.error('获取队伍列表失败：' + (data ? data.code + ":" + data.message : data), 3);
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
    delete = () => {
        delTeamByIds({id: [this.state.record.id]}).then((data) => {
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
    deleteMulti = () => {
        delTeamByIds({id: this.state.selectedRowKeys}).then((data) => {
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
        this.showTeamModifyDialog();
    };
    onSelectChange = (selectedRowKeys) => {
        this.setState({selectedRowKeys});
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
    handleTableChange = (pagination, filters, sorter) => {
        const pager = {...this.state.pagination};
        pager.current = pagination.current;
        pager.sortField = sorter.field;
        pager.sortOrder = sorter.order == "descend" ? "desc" : sorter.order == "ascend" ? "asc" : "";
        pager.filters = this.getTableFilters(pager, filters);
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
        const {searchText} = this.state;
        pager.filters = {};
        if (searchText != null && searchText != '') {
            pager.filters["name"] = searchText;
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
    showTeamAddDialog = () => {
        this.setState({dialogAddVisible: true});
    };
    showTeamModifyDialog = () => {
        this.setState({dialogModifyVisible: true});
    };
    handleTeamAddCancel = () => {
        this.setState({dialogAddVisible: false});
    };
    handleTeamModifyCancel = () => {
        this.setState({dialogModifyVisible: false});
    };
    saveTeamDialogRef = (form) => {
        this.formAdd = form;
    };
    saveTeamModifyDialogRef = (form) => {
        this.formModify = form;
    };
    handleTeamAddCreate = () => {
        const form = this.formAdd;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            createTeam(values).then((data) => {
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
    handleTeamModifyCreate = () => {
        const form = this.formModify;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            updateTeamById(values).then((data) => {
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
    handleDelete = () => {
        this.setState({
            deleteVisible: true,
            handleDeleteOK: this.delete,
            deleteCols: 1,
        });
    }
    handleDeleteMulti = () => {
        this.setState({
            deleteVisible: true,
            handleDeleteOK: this.deleteMulti,
            deleteCols: this.state.selectedRowKeys ? this.state.selectedRowKeys.length : 0,
        })
    }
    handleDeleteCancel = () => {
        this.setState({deleteVisible: false});
    }
    handleUploadChange = (info) => {
        if (info.file.status === 'uploading') {
            this.setState({uploadloading: true});
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            this.setState({
                uploadloading: false,
            });
            message.success(info.file.response.message + "10秒后自动刷新(或者待会手动刷新)", 10);
            setTimeout(() => {
                this.refresh();
            }, 10000);
        }
        if (info.file.status === 'error') {
            this.setState({
                uploadloading: false,
            });
            message.error(info.file.response.message, 10);
            return;
        }
    }
    handleViewLeague = () => {
        this.setState({teamLeagueVisible: true})
    }
    handleViewLeagueCancel = () => {
        this.setState({teamLeagueVisible: false})
    }

    render() {
        const onNameClick = this.onNameClick;
        const {selectedRowKeys} = this.state;

        const AddDialog = Form.create()(OneyuanTeamAddDialog);
        const ModifyDialog = Form.create()(OneyuanTeamModifyDialog);

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
            title: '队名',
            align: 'center',
            dataIndex: 'name',
            filterDropdown: (
                <div className="custom-filter-dropdown">
                    <Input
                        ref={ele => this.searchInput = ele}
                        placeholder="搜索"
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
                return <div className="center"><Avatar src={record.headImg ? record.headImg : defultAvatar}/>
                    <p className="ml-s cursor-hand"
                       onClick={onNameClick.bind(this, record)}>{record.name}{record.shortName ? "(" + record.shortName + ")" : ""}</p>
                </div>;
            },
        }, {
            title: '地区',
            align: 'center',
            dataIndex: 'province',
            width: '20%',
            render: function (text, record, index) {
                return <p>{record.province ? record.province : "-"}/{record.city ? record.city : "-"}</p>
            }
        }, {
            title: '人数',
            align: 'center',
            dataIndex: 'population',
            width: '10%',
        },  {
            title: '小程序',
            dataIndex: 'wechatType',
            width: '10%',
            align: 'center',
            render: function (text, record, index) {
                let type = "未知"
                switch (record.wechatType) {
                    case 0 :
                        type = "1元体育";
                        break;
                    case 1 :
                        type = "青少年";
                        break;
                    case 2 :
                        type = "茄子FC";
                        break;
                }
                return type;
            },
        }, {
            title: '备注',
            align: 'center',
            dataIndex: 'remark',
            width: '20%',
        }, {
            title: <span>id</span>,
            align: 'center',
            width: '10%',
            render: function (text, record, index) {
                return <p className="cursor-hand" onClick={() => {
                    copy(`${record.id}`);
                    message.success('id已复制到剪贴板');
                }}>{record.id ? `${record.id}` : "-"}</p>
            }
        }
        ];
        const columns_moblie = [{
            title: '队名',
            align: 'center',
            dataIndex: 'name',
            filterDropdown: (
                <div className="custom-filter-dropdown">
                    <Input
                        ref={ele => this.searchInput = ele}
                        placeholder="搜索"
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
        },
        ];
        return <div><Table columns={isMobile ? columns_moblie : columns}
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
                                               onClick={this.showTeamAddDialog}/>
                                   </Tooltip>
                                   <Upload
                                       className="ml-s"
                                       accept=".docx"
                                       action={uploaddocx_team}
                                       listType="text"
                                       withCredentials={true}
                                       showUploadList={false}
                                       onChange={this.handleUploadChange}
                                       disabled={this.state.uploadloading}
                                   >
                                       {
                                           <Tooltip title="导入">
                                               <Button type="primary"
                                                       shape="circle"
                                                       icon={this.state.uploadloading ? "loading" : "import"}/>
                                           </Tooltip>
                                       }

                                   </Upload>
                                   <Tooltip title="删除">
                                       <Button type="danger" shape="circle" icon="delete"
                                               hidden={this.state.selectedRowKeys.length > 0 ? false : true}
                                               onClick={this.handleDeleteMulti}>{selectedRowKeys.length}</Button>
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
                width={600}
                visible={this.state.dialogAddVisible}
                title="添加队伍"
                okText="确定"
                onCancel={this.handleTeamAddCancel}
                destroyOnClose="true"
                onOk={this.handleTeamAddCreate}
            >
                <AddDialog
                    visible={this.state.dialogAddVisible}
                    ref={this.saveTeamDialogRef}/>
            </Modal>

            <Modal
                width={600}
                visible={this.state.dialogModifyVisible}
                title="编辑队伍"
                okText="确定"
                onCancel={this.handleTeamModifyCancel}
                destroyOnClose="true"
                onOk={this.handleTeamModifyCreate}
                footer={[
                    <Button key="more" type="primary" className="pull-left">
                        <Link to={
                            "/oneyuan/oneyuanTeam/" + this.state.record.id
                        }>详细设置</Link>
                    </Button>,
                    <Button key="team" type="primary" className="pull-left"
                            onClick={this.handleViewLeague}>查看所在联赛</Button>,
                    <Button key="delete" type="danger" className="pull-left"
                            onClick={this.handleDelete}>删除</Button>,
                    <Button key="back" onClick={this.handleTeamModifyCancel}>取消</Button>,
                    <Button key="submit" type="primary" onClick={this.handleTeamModifyCreate}>
                        确定
                    </Button>
                ]}
            >
                <ModifyDialog
                    visible={this.state.dialogModifyVisible}
                    ref={this.saveTeamModifyDialogRef}
                    record={this.state.record}/>
            </Modal>
            <Modal
                className={isMobile ? "top-n" : ""}
                title="确认删除"
                visible={this.state.deleteVisible}
                onOk={this.state.handleDeleteOK}
                onCancel={this.handleDeleteCancel}
                zIndex={1001}
            >
                <p className="mb-n" style={{fontSize: 14}}>是否确认删除{this.state.deleteCols}条数据？</p>
            </Modal>
            <Modal
                className={isMobile ? "top-n" : ""}
                title="查看所在联赛"
                visible={this.state.teamLeagueVisible}
                onCancel={this.handleViewLeagueCancel}
                zIndex={1001}
                destroyOnClose
            >
                {this.state.record && this.state.record.leagues && this.state.record.leagues.map(data => {
                    return <div className="w-full center mb-l">
                        <Avatar src={data.headImg}/>
                        <span className="ml-s">{data.shortName ? data.shortName : data.name}</span>
                    </div>
                })}
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

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanTeamTable);
