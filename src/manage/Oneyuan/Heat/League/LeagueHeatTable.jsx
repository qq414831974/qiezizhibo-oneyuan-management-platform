import React from 'react';
import {Table, Input, Button, Icon, Modal, Tooltip, Radio, Avatar, Row, Col} from 'antd';
import {
    getLeaguePlayerHeat,
    getLeagueTeamHeat,
    addLeaguePlayerHeat,
    addLeagueTeamHeat,
    addFakeGiftOrder
} from '../../../../axios/index';
import {Form, message} from "antd/lib/index";
import LeagueHeatAddDialog from './LeagueHeatAddDialog';
import LeagueHeatFakeAddDialog from './LeagueHeatFakeAddDialog';
import {receiveData} from "../../../../action";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import logo from "../../../../static/logo.png";
import defultAvatar from "../../../../static/avatar.jpg";
import NP from 'number-precision'

class LeagueHeatTable extends React.Component {
    state = {
        data: [],
        pagination: {pageSize: 10, filters: {}},
        loading: false,
        filterDropdownVisible: false,
        searchText: '',
        filtered: false,
        selectedRowKeys: [],
        dialogAddVisible: false,
        record: {},
    };

    componentDidMount() {
        this.fetch({
            pageSize: this.state.pagination.pageSize,
            pageNum: 1,
        });
    };

    fetch = (params) => {
        if (this.props.heatRule && this.props.heatRule.type == 2) {
            this.getLeaguePlayerHeat({leagueId: this.props.leagueId, ...params});
        } else if (this.props.heatRule && this.props.heatRule.type == 3) {
            this.getLeagueTeamHeat({leagueId: this.props.leagueId, ...params});
        }
    }
    getLeaguePlayerHeat = (params) => {
        this.setState({loading: true});
        getLeaguePlayerHeat(params).then((data) => {
            if (data && data.code == 200) {
                const pagination = {...this.state.pagination};
                pagination.total = data.data ? data.data.total : 0;
                pagination.current = data.data ? data.data.current : 1;
                this.setState({
                    loading: false,
                    data: data.data ? data.data.records : "",
                    pagination,
                });
            } else {
                message.error('获取比赛队员热度列表失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    }
    getLeagueTeamHeat = (params) => {
        this.setState({loading: true});
        getLeagueTeamHeat(params).then((data) => {
            if (data && data.code == 200) {
                const pagination = {...this.state.pagination};
                pagination.total = data.data ? data.data.total : 0;
                pagination.current = data.data ? data.data.current : 1;
                this.setState({
                    loading: false,
                    data: data.data ? data.data.records : "",
                    pagination,
                });
            } else {
                message.error('获取比赛队伍热度列表失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
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
    onNameClick = (record, e) => {
        let target = null
        if (this.props.heatRule && this.props.heatRule.type == 2) {
            target = this.getPlayer(record.player);
        } else if (this.props.heatRule && this.props.heatRule.type == 3) {
            target = this.getTeam(record.team);
        }
        this.setState({record: record, heatRule: this.props.heatRule, target: target, dialogChoiceVisible: true});
    }
    saveLeagueHeatFakeAddDialogRef = (form) => {
        this.formFakeAdd = form;
    }
    showLeagueHeatFakeAddDialog = () => {
        this.setState({dialogFakeAddVisible: true});
    };
    handleLeagueHeatFakeAddCancel = () => {
        this.setState({dialogFakeAddVisible: false});
    };

    handleLeagueHeatFakeAddCreate = () => {
        const form = this.formFakeAdd;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            addFakeGiftOrder(values).then(data => {
                if (data && data.code == 200) {
                    if (data.data) {
                        this.refresh();
                        this.setState({dialogChoiceVisible: false});
                        message.success('添加成功', 3);
                    }
                } else {
                    message.error('添加失败：' + (data ? data.code + ":" + data.message : data), 3);
                }
            })
            this.setState({dialogFakeAddVisible: false});
        });
    };

    saveLeagueHeatAddDialogRef = (form) => {
        this.formAdd = form;
    }
    showLeagueHeatAddDialog = () => {
        this.setState({dialogAddVisible: true});
    };
    handleLeagueHeatAddCancel = () => {
        this.setState({dialogAddVisible: false});
    };
    handleLeagueHeatAddCreate = () => {
        // const form = this.formAdd;
        // form.validateFields((err, values) => {
        //     if (err) {
        //         return;
        //     }
        //     if (this.props.heatRule && this.props.heatRule.type == 2) {
        //         this.addPlayerHeat(values.leagueId, values.playerId, values.heat);
        //     } else if (this.props.heatRule && this.props.heatRule.type == 3) {
        //         this.addTeamHeat(values.leagueId, values.teamId, values.heat);
        //     }
        //     form.resetFields();
        //     this.setState({dialogAddVisible: false});
        // });
    };
    handleChoiceCancel = () => {
        this.setState({dialogChoiceVisible: false});
    };
    addPlayerHeat = (leagueId, playerId, heat) => {
        addLeaguePlayerHeat({leagueId, playerId, heat}).then((data) => {
            if (data && data.code == 200) {
                if (data.data) {
                    this.refresh();
                    message.success('添加成功', 3);
                }
            } else {
                message.error('添加失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    }
    addTeamHeat = (leagueId, teamId, heat) => {
        addLeagueTeamHeat({leagueId, teamId, heat}).then((data) => {
            if (data && data.code == 200) {
                if (data.data) {
                    this.refresh();
                    message.success('添加成功', 3);
                }
            } else {
                message.error('添加失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    }
    getPlayer = (player) => {
        if (player == null) {
            return {};
        }
        return player;
    }
    getTeam = (team) => {
        if (team == null) {
            return {};
        }
        return team;
    }

    render() {
        const onNameClick = this.onNameClick;

        const AddDialog = Form.create()(LeagueHeatAddDialog);
        const FakeAddDialog = Form.create()(LeagueHeatFakeAddDialog);
        const getPlayer = this.getPlayer;
        const getTeam = this.getTeam;

        const isMobile = this.props.responsive.data.isMobile;


        const columns = [{
            title: '队伍/队员',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: '40%',
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
            render: function (text, record, index) {
                if (record.playerId) {
                    const player = getPlayer(record.player);
                    return <div className="center"><Avatar src={player && player.headImg ? player.headImg : logo}/>
                        <a className="ml-s"
                           onClick={onNameClick.bind(this, record)}>{player ? `${player.name}(${record.sequence}号)` : "未知"}</a>
                    </div>;
                }
                if (record.teamId) {
                    const team = getTeam(record.team);
                    return <div className="center"><Avatar src={team && team.headImg ? team.headImg : logo}/>
                        <a className="ml-s"
                           onClick={onNameClick.bind(this, record)}>{team ? `${team.name}` : "未知"}</a>
                    </div>;
                }
                return <span>未知</span>;
            }
        }, {
            title: '热度',
            key: 'heat',
            dataIndex: 'heat',
            width: '20%',
            align: 'center',
            render: function (text, record, index) {
                return <a className="ml-s" onClick={onNameClick.bind(this, record)}>{record.heat + record.heatBase}</a>;
            },

        },{
            title: '礼物总金额（元）',
            key: 'giftPriceTotal',
            dataIndex: 'giftPriceTotal',
            width: '20%',
            align: 'center',
            render: function (text, record, index) {
                if (record.giftPriceTotal) {
                    return <a className="ml-s" onClick={onNameClick.bind(this, record)}>
                        {NP.divide(record.giftPriceTotal, 100)}
                    </a>;
                }
                return "-";
        },
        }

        ];
        if (this.props.heatRule && this.props.heatRule.cashAvailable) {
            columns.push({
                title: '预计提现金额（元）',
                key: 'cashPredict',
                dataIndex: 'cashPredict',
                width: '20%',
                align: 'center',
                render: function (text, record, index) {
                    if (record.cashPredict) {
                        return <a className="ml-s" onClick={onNameClick.bind(this, record)}>
                            {NP.divide(record.cashPredict, 100)} {record.cashPercent ? `（${record.cashPercent}%）` : null}
                        </a>;
                    }
                    return "-";
                },
            },)
        }
        return <div><Table columns={columns}
                           rowKey={record => record.id}
                           dataSource={this.state.data}
                           loading={this.state.loading}
                           bordered
                           pagination={this.state.pagination}
                           onChange={this.handleTableChange}
                           title={() =>
                               <div style={{height: 32}}>
                                   <Tooltip title="刷新">
                                       <Button type="primary" shape="circle" icon="reload" className="pull-right"
                                               loading={this.state.loading}
                                               onClick={this.refresh}/>
                                   </Tooltip>
                               </div>
                           }
        />
            <Modal
                className={isMobile ? "top-n" : ""}
                title="添加热度"
                visible={this.state.dialogAddVisible}
                footer={[
                    <Button key="back" onClick={this.handleLeagueHeatAddCancel}>取消</Button>,
                    <Button key="submit" type="primary" onClick={this.handleLeagueHeatAddCreate}>确定</Button>,
                ]}
                onCancel={this.handleLeagueHeatAddCancel}>
                <AddDialog visible={this.state.dialogAddVisible}
                           record={this.state.record}
                           target={this.state.target}
                           heatRule={this.props.heatRule}
                           ref={this.saveLeagueHeatAddDialogRef}/>
            </Modal>
            <Modal
                className={isMobile ? "top-n" : ""}
                title="刷票"
                visible={this.state.dialogFakeAddVisible}
                footer={[
                    <Button key="back" onClick={this.handleLeagueHeatFakeAddCancel}>取消</Button>,
                    <Button key="submit" type="primary" onClick={this.handleLeagueHeatFakeAddCreate}>确定</Button>,
                ]}
                onCancel={this.handleLeagueHeatFakeAddCancel}>
                <FakeAddDialog visible={this.state.dialogFakeAddVisible}
                               record={this.state.record}
                               target={this.state.target}
                               heatRule={this.props.heatRule}
                               ref={this.saveLeagueHeatFakeAddDialogRef}/>
            </Modal>
            <Modal
                className={isMobile ? "top-n" : ""}
                title="请选择"
                visible={this.state.dialogChoiceVisible}
                footer={[
                    <Button key="back" onClick={this.handleChoiceCancel}>取消</Button>,
                ]}
                onCancel={this.handleChoiceCancel}>
                {/*<Row gutter={10}>*/}
                {/*    <Col span={12}>*/}
                {/*        <Button*/}
                {/*            type="primary"*/}
                {/*            className="w-full h-full center"*/}
                {/*            onClick={this.showLeagueHeatAddDialog}>添加热度</Button>*/}
                {/*    </Col>*/}
                {/*    <Col span={12}>*/}
                        <Button
                            type="primary"
                            className="w-full h-full center"
                            onClick={this.showLeagueHeatFakeAddDialog}>刷票</Button>
                {/*    </Col>*/}
                {/*</Row>*/}
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

export default connect(mapStateToProps, mapDispatchToProps)(LeagueHeatTable);