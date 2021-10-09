import React from 'react';
import {
    Form,
    Avatar,
    Button,
    Row,
    Col,
    List,
    Card,
    Modal,
    Radio,
    Switch,
    Skeleton,
    Tabs,
} from 'antd';
import moment from 'moment'
import 'moment/locale/zh-cn';
import {receiveData} from "../../../action";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {
    getLeagueMatchById,
    getLeagueTeam,
    addTeamToLeague,
    updateTeamInLeague,
    deleteTeamInLeague,
    addLeaguePlayer,
    updatePlayerInLeague,
    delPlayerInLeague,
    genLeagueTeamRank,
    genLeaguePlayerRank,
    genLeagueReport,
    getLeagueReport,
    getLeagueRankSetting,
    updateLeagueRankSetting,
    getLeaguePlayer
} from "../../../axios/index";
import avatar from '../../../static/avatar.jpg';
import logo from '../../../static/logo.png';
import {Link, Redirect} from 'react-router-dom';
import BreadcrumbCustom from '../../Components/BreadcrumbCustom';
import OneyuanLeagueMatchAddTeamDialog from "./OneyuanLeagueMatchAddTeamDialog";
import OneyuanLeagueMatchModifyTeamDialog from "./OneyuanLeagueMatchModifyTeamDialog";
import OneyuanLeagueMatchAddPlayerDialog from "./OneyuanLeagueMatchAddPlayerDialog";
import OneyuanLeagueMatchModifyPlayerDialog from "./OneyuanLeagueMatchModifyPlayerDialog";
import {message} from "antd/lib/index";
import NP from 'number-precision'

moment.locale('zh-cn');

const {TabPane} = Tabs;

const FormItem = Form.Item;

const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 4},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 16},
    },
};

class OneyuanLeagueMatchDetailManagement extends React.Component {
    state = {teamList: [], playerList: [], teamSwitch: true, playerSwitch: true}

    componentDidMount() {
        if (!(this.props.match.params && this.props.match.params.id)) {
            return;
        }
        this.fetch();
    }

    fetch = () => {
        getLeagueMatchById(this.props.match.params.id).then(data => {
            if (data && data.code == 200 && data.data) {
                this.setState({
                    data: data.data,
                    teamListloading: true,
                });
                if (data.data && data.data.id) {
                    getLeagueTeam({leagueId: data.data.id}).then(res => {
                        if (res && res.code == 200) {
                            this.setState({teamList: res.data, teamListloading: false});
                        }
                    })
                }
            }
        });
        getLeagueRankSetting({leagueId: this.props.match.params.id}).then(data => {
            let autoRank = false;
            let showLeagueTeam = false;
            let showLeaguePlayer = false;
            if (data && data.data && data.data.id) {
                autoRank = data.data.autoRank;
                showLeagueTeam = data.data.showLeagueTeam;
                showLeaguePlayer = data.data.showLeaguePlayer;
            }
            this.setState({teamSwitch: showLeagueTeam, playerSwitch: showLeaguePlayer, sortradiovalue: autoRank})
        });
        this.setState({playerListLoading: true});
        getLeaguePlayer({leagueId: this.props.match.params.id}).then(data => {
            if (data && data.code == 200) {
                this.setState({playerList: data.data, playerListLoading: false});
                if (data.data) {
                    const totalPoint = data.data.filter(item => {
                        return item.threePoint != null && item.twoPoint != null && item.onePoint != null
                            && (item.threePoint + item.twoPoint + item.onePoint) > 0
                    }).sort((a, b) => {
                        const aPoint = a.threePoint * 3 + a.twoPoint * 2 + a.onePoint;
                        const bPoint = b.threePoint * 3 + b.twoPoint * 2 + b.onePoint;
                        if (bPoint - aPoint == 0) {
                            return (b.threePoint - a.threePoint) || (b.twoPoint - a.twoPoint) || (b.onePoint - a.onePoint)
                        }
                        return bPoint - aPoint
                    }).map(item => {
                        item.totalPoint = item.threePoint * 3 + item.twoPoint * 2 + item.onePoint
                        return item;
                    });
                    this.setState({totalPointList: totalPoint})
                    const threePoint = data.data.filter(item => item.threePoint != null && item.threePoint != 0).sort((a, b) => {
                        return b.threePoint - a.threePoint
                    })
                    this.setState({threePointList: threePoint})
                    const twoPoint = data.data.filter(item => item.twoPoint != null && item.twoPoint != 0).sort((a, b) => {
                        return b.twoPoint - a.twoPoint
                    })
                    this.setState({twoPointList: twoPoint})
                    const onePoint = data.data.filter(item => item.onePoint != null && item.onePoint != 0).sort((a, b) => {
                        return b.onePoint - a.onePoint
                    })
                    this.setState({onePointList: onePoint})
                    const foul = data.data.filter(item => item.foul != null && item.foul != 0).sort((a, b) => {
                        return b.foul - a.foul
                    })
                    this.setState({foulList: foul})
                    const snatch = data.data.filter(item => item.snatch != null && item.snatch != 0).sort((a, b) => {
                        return b.snatch - a.snatch
                    })
                    this.setState({snatchList: snatch})
                    const backboard = data.data.filter(item => item.backboard != null && item.backboard != 0).sort((a, b) => {
                        return b.backboard - a.backboard
                    })
                    this.setState({backboardList: backboard})
                    const assists = data.data.filter(item => item.assists != null && item.assists != 0).sort((a, b) => {
                        return b.assists - a.assists
                    })
                    this.setState({assistsList: assists})
                }

            } else {
                this.setState({playerListLoading: false});
            }
        });
        // getLeagueReport({leagueId: this.props.match.params.id}).then(data => {
        //     if (data && data.code == 200) {
        //         if (data.data) {
        //             this.setState({reportUrl: data.data.url});
        //         }
        //     }
        // })
    }
    refresh = () => {
        this.fetch();
    }
    refreshReport = () => {
        getLeagueReport({leagueId: this.props.match.params.id}).then(data => {
            if (data && data.code == 200) {
                this.setState({reportUrl: data.data.url});
            }
        })
    }
    onAddTeamClick = (e) => {
        this.setState({addTeamVisible: true});
    }
    onAddPlayerClick = (e) => {
        this.setState({addPlayerVisible: true});
    }
    onTeamClick = (record) => {
        this.setState({currentTeam: record, modifyTeamVisible: true});
    }
    onPlayerClick = (record) => {
        this.setState({currentPlayer: record, modifyPlayerVisible: true});
    }
    handleAddPlayerOK = () => {
        const form = this.addPlayerForm;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            addLeaguePlayer(values).then((data) => {
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
            this.setState({addPlayerVisible: false});
        });
    }
    handleAddTeamOK = () => {
        const form = this.addTeamForm;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            addTeamToLeague(values).then((data) => {
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
            this.setState({addTeamVisible: false});
        });
    }
    handleModifyPlayerOK = () => {
        const form = this.modifyPlayerForm;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            updatePlayerInLeague(values).then((data) => {
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
            this.setState({modifyPlayerVisible: false});
        });
    }
    handleModifyTeamOK = () => {
        const form = this.modifyTeamForm;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            updateTeamInLeague(values).then((data) => {
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
            this.setState({modifyTeamVisible: false});
        });
    }
    handleAddTeamCancel = () => {
        this.setState({addTeamVisible: false});
    }
    handleAddPlayerCancel = () => {
        this.setState({addPlayerVisible: false});
    }
    saveAddTeamDialogRef = (form) => {
        this.addTeamForm = form;
    }
    saveAddPlayerDialogRef = (form) => {
        this.addPlayerForm = form;
    }
    handleModifyTeamCancel = () => {
        this.setState({modifyTeamVisible: false});
    }
    handleModifyPlayerCancel = () => {
        this.setState({modifyPlayerVisible: false});
    }
    saveModifyTeamDialogRef = (form) => {
        this.modifyTeamForm = form;
    }
    saveModifyPlayerDialogRef = (form) => {
        this.modifyPlayerForm = form;
    }
    handleTeamDelete = () => {
        this.setState({deleteVisible: true, handleDeleteOK: this.handleDeleteTeamOK});
    }
    handlePlayerDelete = () => {
        this.setState({deleteVisible: true, handleDeleteOK: this.handleDeletePlayerOK});
    }
    handleDeletePlayerOK = () => {
        this.state.currentPlayer &&
        delPlayerInLeague({
            leagueId: this.state.currentPlayer.leagueId,
            teamId: this.state.currentPlayer.teamId,
            playerId: this.state.currentPlayer.playerId
        }).then(data => {
            this.setState({deleteVisible: false, modifyPlayerVisible: false});
            if (data && data.code == 200) {
                if (data.data) {
                    this.refresh();
                    message.success('删除成功', 1);
                } else {
                    message.success(data.message, 1);
                }
            } else {
                message.error('删除失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }
    handleDeleteTeamOK = () => {
        this.state.currentTeam &&
        deleteTeamInLeague({
            leagueId: this.state.currentTeam.leagueId,
            teamId: this.state.currentTeam.teamId
        }).then(data => {
            this.setState({deleteVisible: false, modifyTeamVisible: false});
            if (data && data.code == 200) {
                if (data.data) {
                    this.refresh();
                    message.success('删除成功', 1);
                } else {
                    message.success(data.message, 1);
                }
            } else {
                message.error('删除失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }
    handleDeleteCancel = () => {
        this.setState({deleteVisible: false});
    }
    onSortRadioChange = (e) => {
        updateLeagueRankSetting({leagueId: this.props.match.params.id, autoRank: e.target.value}).then((data) => {
            if (data && data.code == 200) {
                if (data.data) {
                    this.refresh();
                    message.success('修改成功', 1);
                    this.setState({
                        sortradiovalue: e.target.value,
                    });
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('修改失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    }
    onLeagueTeamSwitchChange = (e) => {
        updateLeagueRankSetting({leagueId: this.props.match.params.id, showLeagueTeam: e}).then((data) => {
            if (data && data.code == 200) {
                if (data.data) {
                    this.refresh();
                    message.success('修改成功', 1);
                    this.setState({teamSwitch: e});
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('修改失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    }
    onLeaguePlayerSwitchChange = (e) => {
        updateLeagueRankSetting({leagueId: this.props.match.params.id, showLeaguePlayer: e}).then((data) => {
            if (data && data.code == 200) {
                if (data.data) {
                    this.refresh();
                    message.success('修改成功', 1);
                    this.setState({playerSwitch: e});
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('修改失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    }
    getGroupLegueTeam = () => {
        let dom = [];
        if (this.state.teamListloading) {
            return <Skeleton active/>;
        }
        if (this.state.teamList) {
            const indexes = Object.keys(this.state.teamList).sort();
            indexes.forEach(key => {
                const leagueTeam = this.state.teamList[key];
                dom.push(
                    <List
                        key={key}
                        rowKey={record => record.id}
                        header={key}
                        size="small"
                        dataSource={leagueTeam ? leagueTeam : []}
                        loading={this.state.teamListloading}
                        renderItem={item => (<div className="cell-hover pa-s cursor-hand"
                                                  onClick={this.onTeamClick.bind(this, item)}>
                            <Avatar size="large" src={item.team.headImg ? item.team.headImg : logo}/>
                            <span className="ml-s">{item.team.name}</span>
                            <div className="pull-right pa-s">
                                <span
                                    className="pl-s pr-s">{item.matchTotal ? item.matchTotal : 0}</span>
                                <span
                                    className="pl-s pr-s">{`${item.matchWin ? item.matchWin : 0}/${item.matchLost ? item.matchLost : 0}`}</span>
                                <span
                                    className="pl-s pr-s">{`${item.totalGoal ? item.totalGoal : 0}/${item.totalGoalLost ? item.totalGoalLost : 0}`}</span>
                                <span className="pl-s pr-s">{item.ranks ? item.ranks : 0}</span>
                            </div>
                        </div>)}
                    />)
            })
        }
        return dom;
    }
    genLeagueTeamRank = () => {
        message.info("正在生成，请稍后", 10)
        genLeagueTeamRank({leagueId: this.state.data.id}).then(data => {
            if (data && data.code == 200) {
                if (data.data) {
                    this.refresh();
                    message.success('生成成功', 1);
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('生成失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    }
    genLeaguePlayerRank = () => {
        message.info("正在生成，请稍后", 10)
        genLeaguePlayerRank({leagueId: this.state.data.id}).then(data => {
            if (data && data.code == 200) {
                if (data.data) {
                    this.refresh();
                    message.success('生成成功', 1);
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('生成失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        });
    }
    genLeagueReport = () => {
        message.info("正在生成，请稍后", 10)
        genLeagueReport({leagueId: this.state.data.id}).then(data => {
            if (data && data.code == 200) {
                if (data.data && data.data.id) {
                    this.refreshReport();
                    message.destroy();
                    message.success('生成成功', 1);
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('生成失败：' + (data ? data.code + ":" + data.message : data), 3);
            }
        })
    }
    getAverage = (num, totalMatch) => {
        if (totalMatch == 0) {
            return 0;
        }
        return NP.divide(num, totalMatch).toFixed(1);
    }

    render() {
        const isMobile = this.props.responsive.data.isMobile;
        if (!(this.props.match.params && this.props.match.params.id)) {
            return <Redirect push to="/oneyuan/oneyuanLeagueMatch"/>;
        }
        const AddTeamDialog = Form.create()(OneyuanLeagueMatchAddTeamDialog);
        const ModifyTeamDialog = Form.create()(OneyuanLeagueMatchModifyTeamDialog);
        const AddPlayerDialog = Form.create()(OneyuanLeagueMatchAddPlayerDialog);
        const ModifyPlayerDialog = Form.create()(OneyuanLeagueMatchModifyPlayerDialog);
        return (
            <div>
                <BreadcrumbCustom first={<Link to={'/oneyuan/oneyuanLeagueMatch'}>联赛管理</Link>} second="详细设置"/>
                <div className="dark-white pa-s">
                    <div className="w-full center">
                        <Avatar size="large"
                                src={this.state.data ? (this.state.data.headImg ? this.state.data.headImg : logo) : logo}/>
                    </div>
                    <div className="w-full center">
                        <span style={{fontSize: 18}}>{this.state.data ? this.state.data.name : "无联赛名"}</span>
                    </div>
                    <div className="w-full center">
                        <span>{this.state.data ? `${this.state.data.dateBegin} - ${this.state.data.dateEnd}` : ""}</span>
                    </div>
                    {/*<div className="w-full center">*/}
                    {/*    <Button type="primary" onClick={this.genLeagueReport}>一键生成海报图</Button>*/}
                    {/*</div>*/}
                    {/*<div className="w-full center">*/}
                    {/*    {this.state.reportUrl ?*/}
                    {/*        <a style={{textDecoration: "underline"}}*/}
                    {/*           target="_blank"*/}
                    {/*           href={this.state.reportUrl}>*/}
                    {/*            <span>{this.state.reportUrl}</span>*/}
                    {/*        </a>*/}
                    {/*        :*/}
                    {/*        <span>暂无海报</span>*/}
                    {/*    }*/}
                    {/*</div>*/}
                    <Row gutter={10}>
                        <Col md={12}>
                            <div className="w-full">
                                <div className="w-full center">
                                    <span style={{fontSize: 20, fontWeight: 'bold'}}>积分榜</span>
                                    <Switch checked={this.state.teamSwitch} onChange={this.onLeagueTeamSwitchChange}/>
                                </div>
                                <div className="w-full center">
                                    <Button type="primary" onClick={this.genLeagueTeamRank}>一键生成</Button>
                                </div>
                                <Card className="mt-m" title={<div>
                                    <Button type="primary" shape="circle" icon="plus" onClick={this.onAddTeamClick}/>
                                    <span className="ml-s mr-s">队伍</span>
                                    <Radio.Group onChange={this.onSortRadioChange}
                                                 value={this.state.sortradiovalue}>
                                        <Radio value={true}>自动</Radio>
                                        <Radio value={false}>手动</Radio>
                                    </Radio.Group>
                                    <span
                                        className="pull-right pa-s">赛&nbsp;&nbsp;&nbsp;&nbsp;胜/负&nbsp;&nbsp;&nbsp;&nbsp;进/失&nbsp;&nbsp;&nbsp;&nbsp;积分</span>
                                </div>}>
                                    {this.getGroupLegueTeam()}
                                </Card>
                            </div>
                        </Col>
                        <Col md={12}>
                            <div className="w-full center">
                                <span style={{fontSize: 20, fontWeight: 'bold'}}>队员榜</span>
                                <Switch checked={this.state.playerSwitch} onChange={this.onLeaguePlayerSwitchChange}/>
                            </div>
                            <div className="w-full center">
                                <Button type="primary" onClick={this.genLeaguePlayerRank}>一键生成</Button>
                            </div>
                            <Tabs defaultActiveKey="0">
                                <TabPane tab="得分" key="0">
                                    <Card className="mt-m" title={<div>
                                        <Row gutter={10}>
                                            <Col span={6}>
                                                <Button type="primary" shape="circle" icon="plus"
                                                        className="inline-block"
                                                        onClick={this.onAddPlayerClick}/>
                                                <span className="w-full center inline-block ml-s">队员</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">队伍</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">场均</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">得分</span>
                                            </Col>
                                        </Row>
                                    </div>}>
                                        <List
                                            rowKey={record => record.id}
                                            style={{minHeight: 400}}
                                            size="small"
                                            dataSource={this.state.totalPointList ? this.state.totalPointList : []}
                                            loading={this.state.playerListLoading}
                                            renderItem={item => (
                                                <Row gutter={10} className="cell-hover pa-s cursor-hand"
                                                     onClick={this.onPlayerClick.bind(this, item)}>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.player && item.player.headImg ? item.player.headImg : avatar}/>
                                                        <span
                                                            className="ml-s">{item.player ? item.player.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.team && item.team.headImg ? item.team.headImg : logo}/>
                                                        <span
                                                            className="ml-s">{item.team ? item.team.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span
                                                            className="w-full center">{this.getAverage(item.totalPoint, item.totalMatch)}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span className="w-full center">{item.totalPoint}</span>
                                                    </Col>
                                                </Row>)}
                                        />
                                    </Card>
                                </TabPane>
                                <TabPane tab="三分" key="1">
                                    <Card className="mt-m" title={<div>
                                        <Row gutter={10}>
                                            <Col span={6}>
                                                <Button type="primary" shape="circle" icon="plus"
                                                        className="inline-block"
                                                        onClick={this.onAddPlayerClick}/>
                                                <span className="w-full center inline-block ml-s">队员</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">队伍</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">场均</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">三分</span>
                                            </Col>
                                        </Row>
                                    </div>}>
                                        <List
                                            rowKey={record => record.id}
                                            style={{minHeight: 400}}
                                            size="small"
                                            dataSource={this.state.threePointList ? this.state.threePointList : []}
                                            loading={this.state.playerListLoading}
                                            renderItem={item => (
                                                <Row gutter={10} className="cell-hover pa-s cursor-hand"
                                                     onClick={this.onPlayerClick.bind(this, item)}>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.player && item.player.headImg ? item.player.headImg : avatar}/>
                                                        <span
                                                            className="ml-s">{item.player ? item.player.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.team && item.team.headImg ? item.team.headImg : logo}/>
                                                        <span
                                                            className="ml-s">{item.team ? item.team.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span
                                                            className="w-full center">{this.getAverage(item.threePoint, item.totalMatch)}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span className="w-full center">{item.threePoint}</span>
                                                    </Col>
                                                </Row>)}
                                        />
                                    </Card>
                                </TabPane>
                                <TabPane tab="两分" key="2">
                                    <Card className="mt-m" title={<div>
                                        <Row gutter={10}>
                                            <Col span={6}>
                                                <Button type="primary" shape="circle" icon="plus"
                                                        className="inline-block"
                                                        onClick={this.onAddPlayerClick}/>
                                                <span className="w-full center inline-block ml-s">队员</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">队伍</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">场均</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">两分</span>
                                            </Col>
                                        </Row>
                                    </div>}>
                                        <List
                                            rowKey={record => record.id}
                                            style={{minHeight: 400}}
                                            size="small"
                                            dataSource={this.state.twoPointList ? this.state.twoPointList : []}
                                            loading={this.state.playerListLoading}
                                            renderItem={item => (
                                                <Row gutter={10} className="cell-hover pa-s cursor-hand"
                                                     onClick={this.onPlayerClick.bind(this, item)}>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.player && item.player.headImg ? item.player.headImg : avatar}/>
                                                        <span
                                                            className="ml-s">{item.player ? item.player.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.team && item.team.headImg ? item.team.headImg : logo}/>
                                                        <span
                                                            className="ml-s">{item.team ? item.team.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span
                                                            className="w-full center">{this.getAverage(item.twoPoint, item.totalMatch)}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span className="w-full center">{item.twoPoint}</span>
                                                    </Col>
                                                </Row>)}
                                        />
                                    </Card>
                                </TabPane>
                                <TabPane tab="罚球" key="3">
                                    <Card className="mt-m" title={<div>
                                        <Row gutter={10}>
                                            <Col span={6}>
                                                <Button type="primary" shape="circle" icon="plus"
                                                        className="inline-block"
                                                        onClick={this.onAddPlayerClick}/>
                                                <span className="w-full center inline-block ml-s">队员</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">队伍</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">场均</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">罚球</span>
                                            </Col>
                                        </Row>
                                    </div>}>
                                        <List
                                            rowKey={record => record.id}
                                            style={{minHeight: 400}}
                                            size="small"
                                            dataSource={this.state.onePointList ? this.state.onePointList : []}
                                            loading={this.state.playerListLoading}
                                            renderItem={item => (
                                                <Row gutter={10} className="cell-hover pa-s cursor-hand"
                                                     onClick={this.onPlayerClick.bind(this, item)}>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.player && item.player.headImg ? item.player.headImg : avatar}/>
                                                        <span
                                                            className="ml-s">{item.player ? item.player.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.team && item.team.headImg ? item.team.headImg : logo}/>
                                                        <span
                                                            className="ml-s">{item.team ? item.team.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span
                                                            className="w-full center">{this.getAverage(item.onePoint, item.totalMatch)}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span className="w-full center">{item.onePoint}</span>
                                                    </Col>
                                                </Row>)}
                                        />
                                    </Card>
                                </TabPane>
                                <TabPane tab="犯规" key="4">
                                    <Card className="mt-m" title={<div>
                                        <Row gutter={10}>
                                            <Col span={6}>
                                                <Button type="primary" shape="circle" icon="plus"
                                                        className="inline-block"
                                                        onClick={this.onAddPlayerClick}/>
                                                <span className="w-full center inline-block ml-s">队员</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">队伍</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">场均</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">犯规</span>
                                            </Col>
                                        </Row>
                                    </div>}>
                                        <List
                                            rowKey={record => record.id}
                                            style={{minHeight: 400}}
                                            size="small"
                                            dataSource={this.state.foulList ? this.state.foulList : []}
                                            loading={this.state.playerListLoading}
                                            renderItem={item => (
                                                <Row gutter={10} className="cell-hover pa-s cursor-hand"
                                                     onClick={this.onPlayerClick.bind(this, item)}>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.player && item.player.headImg ? item.player.headImg : avatar}/>
                                                        <span
                                                            className="ml-s">{item.player ? item.player.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.team && item.team.headImg ? item.team.headImg : logo}/>
                                                        <span
                                                            className="ml-s">{item.team ? item.team.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span
                                                            className="w-full center">{this.getAverage(item.foul, item.totalMatch)}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span className="w-full center">{item.foul}</span>
                                                    </Col>
                                                </Row>)}
                                        />
                                    </Card>
                                </TabPane>
                                <TabPane tab="抢断" key="5">
                                    <Card className="mt-m" title={<div>
                                        <Row gutter={10}>
                                            <Col span={6}>
                                                <Button type="primary" shape="circle" icon="plus"
                                                        className="inline-block"
                                                        onClick={this.onAddPlayerClick}/>
                                                <span className="w-full center inline-block ml-s">队员</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">队伍</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">场均</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">抢断</span>
                                            </Col>
                                        </Row>
                                    </div>}>
                                        <List
                                            rowKey={record => record.id}
                                            style={{minHeight: 400}}
                                            size="small"
                                            dataSource={this.state.snatchList ? this.state.snatchList : []}
                                            loading={this.state.playerListLoading}
                                            renderItem={item => (
                                                <Row gutter={10} className="cell-hover pa-s cursor-hand"
                                                     onClick={this.onPlayerClick.bind(this, item)}>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.player && item.player.headImg ? item.player.headImg : avatar}/>
                                                        <span
                                                            className="ml-s">{item.player ? item.player.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.team && item.team.headImg ? item.team.headImg : logo}/>
                                                        <span
                                                            className="ml-s">{item.team ? item.team.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span
                                                            className="w-full center">{this.getAverage(item.snatch, item.totalMatch)}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span className="w-full center">{item.snatch}</span>
                                                    </Col>
                                                </Row>)}
                                        />
                                    </Card>
                                </TabPane>
                                <TabPane tab="篮板" key="6">
                                    <Card className="mt-m" title={<div>
                                        <Row gutter={10}>
                                            <Col span={6}>
                                                <Button type="primary" shape="circle" icon="plus"
                                                        className="inline-block"
                                                        onClick={this.onAddPlayerClick}/>
                                                <span className="w-full center inline-block ml-s">队员</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">队伍</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">场均</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">篮板</span>
                                            </Col>
                                        </Row>
                                    </div>}>
                                        <List
                                            rowKey={record => record.id}
                                            style={{minHeight: 400}}
                                            size="small"
                                            dataSource={this.state.backboardList ? this.state.backboardList : []}
                                            loading={this.state.playerListLoading}
                                            renderItem={item => (
                                                <Row gutter={10} className="cell-hover pa-s cursor-hand"
                                                     onClick={this.onPlayerClick.bind(this, item)}>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.player && item.player.headImg ? item.player.headImg : avatar}/>
                                                        <span
                                                            className="ml-s">{item.player ? item.player.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.team && item.team.headImg ? item.team.headImg : logo}/>
                                                        <span
                                                            className="ml-s">{item.team ? item.team.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span
                                                            className="w-full center">{this.getAverage(item.backboard, item.totalMatch)}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span className="w-full center">{item.backboard}</span>
                                                    </Col>
                                                </Row>)}
                                        />
                                    </Card>
                                </TabPane>
                                <TabPane tab="助攻" key="7">
                                    <Card className="mt-m" title={<div>
                                        <Row gutter={10}>
                                            <Col span={6}>
                                                <Button type="primary" shape="circle" icon="plus"
                                                        className="inline-block"
                                                        onClick={this.onAddPlayerClick}/>
                                                <span className="w-full center inline-block ml-s">队员</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">队伍</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">场均</span>
                                            </Col>
                                            <Col span={6}>
                                                <span className="w-full center">助攻</span>
                                            </Col>
                                        </Row>
                                    </div>}>
                                        <List
                                            rowKey={record => record.id}
                                            style={{minHeight: 400}}
                                            size="small"
                                            dataSource={this.state.assistsList ? this.state.assistsList : []}
                                            loading={this.state.playerListLoading}
                                            renderItem={item => (
                                                <Row gutter={10} className="cell-hover pa-s cursor-hand"
                                                     onClick={this.onPlayerClick.bind(this, item)}>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.player && item.player.headImg ? item.player.headImg : avatar}/>
                                                        <span
                                                            className="ml-s">{item.player ? item.player.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Avatar size="large"
                                                                src={item.team && item.team.headImg ? item.team.headImg : logo}/>
                                                        <span
                                                            className="ml-s">{item.team ? item.team.name : null}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span
                                                            className="w-full center">{this.getAverage(item.assists, item.totalMatch)}</span>
                                                    </Col>
                                                    <Col span={6}>
                                                        <span className="w-full center">{item.assists}</span>
                                                    </Col>
                                                </Row>)}
                                        />
                                    </Card>
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                </div>
                <Modal
                    className={isMobile ? "top-n" : ""}
                    title="添加队伍"
                    okText="确定"
                    visible={this.state.addTeamVisible}
                    onOk={this.handleAddTeamOK}
                    onCancel={this.handleAddTeamCancel}
                    zIndex={1001}
                    destroyOnClose="true"
                >
                    <AddTeamDialog
                        visible={this.state.addTeamVisible}
                        record={this.state.data}
                        ref={this.saveAddTeamDialogRef}/>
                </Modal>
                <Modal
                    className={isMobile ? "top-n" : ""}
                    title="添加队员"
                    okText="确定"
                    visible={this.state.addPlayerVisible}
                    onOk={this.handleAddPlayerOK}
                    onCancel={this.handleAddPlayerCancel}
                    zIndex={1001}
                    destroyOnClose="true"
                >
                    <AddPlayerDialog
                        visible={this.state.addPlayerVisible}
                        record={this.state.data}
                        ref={this.saveAddPlayerDialogRef}/>
                </Modal>
                <Modal
                    className={isMobile ? "top-n" : ""}
                    title="编辑队伍"
                    okText="确定"
                    visible={this.state.modifyTeamVisible}
                    onOk={this.handleModifyTeamOK}
                    onCancel={this.handleModifyTeamCancel}
                    zIndex={1001}
                    destroyOnClose="true"
                    footer={[
                        <Button key="delete" type="danger" className="pull-left"
                                onClick={this.handleTeamDelete}>删除</Button>,
                        <Button key="back" onClick={this.handleModifyTeamCancel}>取消</Button>,
                        <Button key="submit" type="primary" onClick={this.handleModifyTeamOK}>
                            确定
                        </Button>
                    ]}
                >
                    <ModifyTeamDialog
                        visible={this.state.modifyTeamVisible}
                        record={this.state.currentTeam}
                        league={this.state.data}
                        ref={this.saveModifyTeamDialogRef}/>
                </Modal>
                <Modal
                    className={isMobile ? "top-n" : ""}
                    title="编辑队员"
                    okText="确定"
                    visible={this.state.modifyPlayerVisible}
                    onOk={this.handleModifyPlayerOK}
                    onCancel={this.handleModifyPlayerCancel}
                    zIndex={1001}
                    destroyOnClose="true"
                    footer={[
                        <Button key="delete" type="danger" className="pull-left"
                                onClick={this.handlePlayerDelete}>删除</Button>,
                        <Button key="back" onClick={this.handleModifyPlayerCancel}>取消</Button>,
                        <Button key="submit" type="primary" onClick={this.handleModifyPlayerOK}>
                            确定
                        </Button>
                    ]}
                >
                    <ModifyPlayerDialog
                        visible={this.state.modifyPlayerVisible}
                        record={this.state.currentPlayer}
                        ref={this.saveModifyPlayerDialogRef}/>
                </Modal>
                <Modal
                    className={isMobile ? "top-n" : ""}
                    title="确认删除"
                    visible={this.state.deleteVisible}
                    onOk={this.state.handleDeleteOK}
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

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanLeagueMatchDetailManagement);