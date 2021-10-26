import React from 'react';
import {
    Form,
    Avatar,
    Col,
    Button,
    Row,
    Progress,
    Timeline,
    Drawer,
    Tooltip,
    Modal,
    Input,
    List, Select, Popconfirm
} from 'antd';
import moment from 'moment'
import 'moment/locale/zh-cn';
import {receiveData} from "../../../../action";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import defultAvatar from '../../../../static/avatar.jpg';
import vs from '../../../../static/vs.png';
import start from '../../../../static/start.svg';
import flag from "../../../../static/flag.svg";
import ball from "../../../../static/ball.svg";
import ball2 from "../../../../static/ball2.svg";
import ball3 from "../../../../static/ball3.svg";
import snatch from "../../../../static/snatch.svg";
import backboard from "../../../../static/backboard.svg";
import assists from "../../../../static/assists.svg";
import {
    getMatchStatus,
    getMatchById,
    getPlayersByTeamId,
    deleteTimelineByIds, deleteTimelineByMatchId,
} from "../../../../axios";
import OneyuanMatchStatisticsAddDialog from './OneyuanMatchStatisticsAddDialog';
import {message} from "antd/lib/index";

const Option = Select.Option;

const status = {
    0: {text: "比赛开始"},
    21: {text: "比赛结束"},
};

const eventType = {
    6: {text: "三分球", icon: ball3,},
    7: {text: "二分球", icon: ball2,},
    8: {text: "罚球", icon: ball,},
    9: {text: "犯规", icon: flag},
    16: {text: "抢断", icon: snatch},
    17: {text: "篮板", icon: backboard},
    18: {text: "助攻", icon: assists},
}
moment.locale('zh-cn');

class OneyuanMatchScoreDialog extends React.Component {
    state = {
        data: {},
        timeline: [],
        playerList: {},
        drawHeight: 270,
        statusDialogScore: {},
        playerStatistics: [],
        teamStatistics: {},
    }

    componentDidMount() {
        if (!this.props.visible) {
            return;
        }
        this.setState({statusLoading: true});
        this.fetch();
        if (this.timerID) {
            clearInterval(this.timerID);
            this.timerID = null
        }
        this.timerID = setInterval(
            () => {
                this.getTimeline();
            },
            30000
        );
    }

    componentWillUnmount() {
        if (this.timerID) {
            clearInterval(this.timerID);
            this.timerID = null
        }
    }

    fetch = () => {
        getMatchById(this.props.matchId).then((data) => {
            if (data && data.code == 200) {
                this.setState({
                    data: data.data,
                });
                this.getPlayerList(data.data);
                this.getTimeline();
            } else {
                message.error('获取比赛失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }
    getPlayerList = (match) => {
        const againstMap = match ? match.againsts : {};
        const teamIdList = [];
        Object.keys(againstMap).forEach(key => {
            const against = againstMap[key];
            if (against && against.hostTeamId) {
                teamIdList.push(against.hostTeamId)
            }
            if (against && against.hostTeamId) {
                teamIdList.push(against.guestTeamId)
            }
        })
        let requestList = [];

        if (teamIdList) {
            for (let teamId of teamIdList) {
                requestList.push(getPlayersByTeamId(teamId, {pageNum: 1, pageSize: 100}))
            }
            this.setState({playerLoading: true})
            Promise.all(requestList).then((values) => {
                const playerList = values.filter(data => {
                    return data && data.code == 200 && data.data != null;
                }).map(data => {
                    return data.data.records
                }).flat();
                const playerMap = {};
                if (playerList) {
                    playerList.forEach(player => {
                        playerMap[player.id] = player;
                    })
                }
                this.setState({playerLoading: false, playerList: playerMap})
            });
        }
    }
    getTimeline = () => {
        getMatchStatus(this.props.matchId).then((res) => {
            if (res && res.code == 200) {
                this.setState({status: res.data, statusLoading: false});
                let timelines = res.data ? res.data.statistics : [];
                this.getPlayerStatistics(timelines)
                this.getTeamStatistics(timelines)
                this.setState({
                    timelineData: timelines,
                });
            } else {
                message.error('获取时间轴失败：' + (res ? res.result + "-" + res.message : res), 3);
            }
        });
    }
    getPlayerStatistics = (timelines) => {
        if (timelines) {
            let statistics = {}
            timelines.forEach(data => {
                if (statistics[data.playerId] == null) {
                    statistics[data.playerId] = {}
                }
                if (statistics[data.playerId][data.eventType] == null) {
                    statistics[data.playerId][data.eventType] = 0;
                }
                statistics[data.playerId][data.eventType] = statistics[data.playerId][data.eventType] + 1;
            })
            let playerStatistics = [];
            for (let key of Object.keys(statistics)) {
                playerStatistics.push({player: this.getPlayer(key), ...statistics[key]});
            }
            this.setState({
                playerStatistics: playerStatistics
            });
        }
    }
    getTeamStatistics = (timelines) => {
        if (timelines) {
            let statistics = {}
            for (let key of Object.keys(this.state.data.againsts)) {
                statistics[key] = {}
                statistics[key].hostGoal = 0
                statistics[key].hostGoalOne = 0
                statistics[key].hostGoalTwo = 0
                statistics[key].hostGoalThree = 0
                statistics[key].hostFoul = 0
                statistics[key].hostSnatch = 0
                statistics[key].hostBackboard = 0
                statistics[key].hostAssists = 0

                statistics[key].guestGoal = 0
                statistics[key].guestGoalOne = 0
                statistics[key].guestGoalTwo = 0
                statistics[key].guestGoalThree = 0
                statistics[key].guestFoul = 0
                statistics[key].guestSnatch = 0
                statistics[key].guestBackboard = 0
                statistics[key].guestAssists = 0
            }

            timelines.forEach(data => {
                const againstIndex = data.againstIndex;
                let isHost = false;
                if (data.teamId == this.state.data.againsts[againstIndex].hostTeamId) {
                    isHost = true;
                }
                switch (data.eventType) {
                    case 6 :
                        if (isHost) {
                            statistics[againstIndex].hostGoalThree = statistics[againstIndex].hostGoalThree + 1;
                            statistics[againstIndex].hostGoal = statistics[againstIndex].hostGoal + 3;
                        } else {
                            statistics[againstIndex].guestGoalThree = statistics[againstIndex].hostGoalThree + 1;
                            statistics[againstIndex].guestGoal = statistics[againstIndex].guestGoal + 3;
                        }
                        break;
                    case 7 :
                        if (isHost) {
                            statistics[againstIndex].hostGoalTwo = statistics[againstIndex].hostGoalTwo + 1;
                            statistics[againstIndex].hostGoal = statistics[againstIndex].hostGoal + 2;
                        } else {
                            statistics[againstIndex].guestGoalTwo = statistics[againstIndex].guestGoalTwo + 1;
                            statistics[againstIndex].guestGoal = statistics[againstIndex].guestGoal + 2;
                        }
                        break;
                    case 8 :
                        if (isHost) {
                            statistics[againstIndex].hostGoalOne = statistics[againstIndex].hostGoalOne + 1;
                            statistics[againstIndex].hostGoal = statistics[againstIndex].hostGoal + 1;
                        } else {
                            statistics[againstIndex].guestGoalOne = statistics[againstIndex].guestGoalOne + 1;
                            statistics[againstIndex].guestGoal = statistics[againstIndex].guestGoal + 1;
                        }
                        break;
                    case 9 :
                        if (isHost) {
                            statistics[againstIndex].hostFoul = statistics[againstIndex].hostFoul + 1;
                        } else {
                            statistics[againstIndex].guestFoul = statistics[againstIndex].guestFoul + 1;
                        }
                        break;
                    case 16 :
                        if (isHost) {
                            statistics[againstIndex].hostSnatch = statistics[againstIndex].hostSnatch + 1;
                        } else {
                            statistics[againstIndex].guestSnatch = statistics[againstIndex].guestSnatch + 1;
                        }
                        break;
                    case 17 :
                        if (isHost) {
                            statistics[againstIndex].hostBackboard = statistics[againstIndex].hostBackboard + 1;
                        } else {
                            statistics[againstIndex].guestBackboard = statistics[againstIndex].guestBackboard + 1;
                        }
                        break;
                    case 18 :
                        if (isHost) {
                            statistics[againstIndex].hostAssists = statistics[againstIndex].hostAssists + 1;
                        } else {
                            statistics[againstIndex].guestAssists = statistics[againstIndex].guestAssists + 1;
                        }
                        break;
                }
            })
            this.setState({
                teamStatistics: statistics
            });
        }
    }
    onTimelineAddClick = () => {
        this.showDrawer();
    }
    initTimeLineDom = () => {
        let data = this.state.timelineData;
        let onDotClick = this.onDotClick;
        let dom = [];
        if (data) {
            data = data.sort((object1, object2) => {
                const value1 = object1["against"];
                const value2 = object2["against"];
                if (!value1 && !value2) {
                    return 0;
                }
                if (value1 > value2) {
                    return 1;
                } else if (value1 < value2) {
                    return -1;
                } else if (value1 == value2) {
                    return 0;
                }
                return 0;
            });
            data.forEach((item, index) => {
                const des = eventType[item.eventType].text
                const hidden = eventType[item.eventType].hidden
                if (!hidden) {
                    const dot = <div>
                        <div className="w-full center">
                            <img className="round-img-xxs-hover" onClick={onDotClick.bind(this, item)}
                                 src={eventType[item.eventType].icon}/>
                        </div>
                        <span className="w-full center">
                            {des}
                        </span>
                        <span className="w-full center">
                            {item.againstIndex ? `(对阵${item.againstIndex})` : null}{item.section ? `(第${item.section}节)` : null}
                        </span>
                    </div>
                    const againstMap = this.state.data && this.state.data.againstTeams ? this.state.data.againstTeams : {};
                    let isHost = false;
                    Object.keys(againstMap).forEach(key => {
                        if (key = item.againstIndex) {
                            const against = againstMap[key];
                            if (against && against.hostTeam && against.hostTeam.id == item.teamId) {
                                isHost = true;
                            } else {
                                isHost = false;
                            }
                        }
                    })
                    const dis = isHost ? "timeline-left" : "timeline-right"
                    const player = this.getPlayer(item.playerId)
                    let line = <Timeline.Item dot={dot} className={dis}>
                        <div style={{height: 36}} className="center pl-l inline-flex-important">
                            {player ? <div className="ml-s">
                                <img src={player.headImg ? player.headImg : defultAvatar} className="round-img-xs"/>
                                <span>{player.name}</span>
                                <span>({player.shirtNum}号)</span>
                            </div> : null}
                        </div>
                    </Timeline.Item>
                    if (isHost) {
                        line = <Timeline.Item dot={dot} className={dis}>
                            <div style={{height: 36}} className="center pr-l inline-flex-important">
                                {player ? <div>
                                    <span>({player.shirtNum}号)</span>
                                    <span>{player.name}</span>
                                    <img src={player.headImg ? player.headImg : defultAvatar} className="round-img-xs"/>
                                </div> : null}
                            </div>
                        </Timeline.Item>;
                    }
                    dom.push(line);
                }
            });
        }
        return dom;
    }
    onDotClick = (item, e) => {
        this.setState({
            deleteVisible: true,
            record: item,
        });
    }
    onDrawClose = () => {
        this.setState({
            drawVisible: false,
            drawHeight: 270
        });
    };
    showDrawer = () => {
        this.setState({
            drawVisible: true,
        });
    };
    onDrawHeightChange = (height) => {
        this.setState({drawHeight: height})
    }
    refreshTimeLine = () => {
        this.getTimeline();
    }
    getMatchAgainstDom = (match) => {
        let dom = [];
        if (match.againstTeams) {
            const matchStatus = this.state.status;
            const matchScoreList = matchStatus && matchStatus.score ? matchStatus.score : null;
            const againstMap = match.againstTeams;
            Object.keys(againstMap).forEach(key => {
                const hostTeam = againstMap[key].hostTeam;
                const guestTeam = againstMap[key].guestTeam;
                let score = null;
                let isCurrent = false;
                if (matchScoreList != null) {
                    score = matchScoreList[key];
                }
                if (matchStatus && matchStatus.status != 21 && matchStatus.status != -1 && matchStatus.againstIndex && matchStatus.againstIndex == key) {
                    isCurrent = true;
                }
                dom.push(<div key={`against-${key}`}
                              className={`center w-full mt-s ${isCurrent ? "cell-highlight" : ""}`}>
                    <span>{hostTeam.name}</span>
                    <Avatar className="ml-s" src={hostTeam.headImg ? hostTeam.headImg : defultAvatar}/>
                    <span className="ml-s mr-s">{matchStatus && matchStatus.status != -1 ? score : "VS"}</span>
                    <Avatar src={guestTeam.headImg ? guestTeam.headImg : defultAvatar}/>
                    <span className="ml-s">{guestTeam.name}</span>
                    {isCurrent ? <span className="danger ml-s">当前对阵</span> : null}
                </div>);
            })
        } else {
            return <span className="cursor-default">{match.name}</span>
        }
        return <div className="w-full cursor-default">
            {dom}
        </div>;
    }
    getTeamStatisticsDom = () => {
        const dom = [];
        return <List
            header={<div className="w-full" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end"
            }}>
                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>得分</div>
                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>三分</div>
                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>两分</div>
                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>罚球</div>
                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>犯规</div>
                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>抢断</div>
                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>篮板</div>
                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>助攻</div>
            </div>}
            bordered
            size="small"
            itemLayout="horizontal"
            dataSource={Object.keys(this.state.teamStatistics)}
            renderItem={(item, index) => (
                <List.Item key={`team-item-${index}`}>
                    <List.Item.Meta title={`对阵${item}`}/>
                    <div className="ml-l"
                         style={{width: "40px", textAlign: "center"}}>
                        {`${this.state.teamStatistics[item].hostGoal ? this.state.teamStatistics[item].hostGoal : 0}`}/
                        {`${this.state.teamStatistics[item].guestGoal ? this.state.teamStatistics[item].guestGoal : 0}`}
                    </div>
                    <div className="ml-l"
                         style={{width: "40px", textAlign: "center"}}>
                        {`${this.state.teamStatistics[item].hostGoalThree ? this.state.teamStatistics[item].hostGoalThree : 0}`}/
                        {`${this.state.teamStatistics[item].guestGoalThree ? this.state.teamStatistics[item].guestGoalThree : 0}`}
                    </div>
                    <div className="ml-l"
                         style={{width: "40px", textAlign: "center"}}>
                        {`${this.state.teamStatistics[item].hostGoalTwo ? this.state.teamStatistics[item].hostGoalTwo : 0}`}/
                        {`${this.state.teamStatistics[item].guestGoalTwo ? this.state.teamStatistics[item].guestGoalTwo : 0}`}
                    </div>
                    <div className="ml-l"
                         style={{width: "40px", textAlign: "center"}}>
                        {`${this.state.teamStatistics[item].hostGoalOne ? this.state.teamStatistics[item].hostGoalOne : 0}`}/
                        {`${this.state.teamStatistics[item].guestGoalOne ? this.state.teamStatistics[item].guestGoalOne : 0}`}
                    </div>
                    <div className="ml-l"
                         style={{width: "40px", textAlign: "center"}}>
                        {`${this.state.teamStatistics[item].hostFoul ? this.state.teamStatistics[item].hostFoul : 0}`}/
                        {`${this.state.teamStatistics[item].guestFoul ? this.state.teamStatistics[item].guestFoul : 0}`}
                    </div>
                    <div className="ml-l"
                         style={{width: "40px", textAlign: "center"}}>
                        {`${this.state.teamStatistics[item].hostSnatch ? this.state.teamStatistics[item].hostSnatch : 0}`}/
                        {`${this.state.teamStatistics[item].guestSnatch ? this.state.teamStatistics[item].guestSnatch : 0}`}
                    </div>
                    <div className="ml-l"
                         style={{width: "40px", textAlign: "center"}}>
                        {`${this.state.teamStatistics[item].hostBackboard ? this.state.teamStatistics[item].hostBackboard : 0}`}/
                        {`${this.state.teamStatistics[item].guestBackboard ? this.state.teamStatistics[item].guestBackboard : 0}`}
                    </div>
                    <div className="ml-l"
                         style={{width: "40px", textAlign: "center"}}>
                        {`${this.state.teamStatistics[item].hostAssists ? this.state.teamStatistics[item].hostAssists : 0}`}/
                        {`${this.state.teamStatistics[item].guestAssists ? this.state.teamStatistics[item].guestAssists : 0}`}
                    </div>
                </List.Item>
            )}
        />;
    }
    handleDeleteCancel = () => {
        this.setState({deleteVisible: false})
    }
    handleDeleteOK = () => {
        const id = this.state.record.id;
        deleteTimelineByIds({id: [id]}).then((data) => {
            if (data && data.code == 200) {
                if (data.data) {
                    message.success("删除成功");
                    this.refreshTimeLine()
                    this.setState({deleteVisible: false})
                }
            } else {
                message.error('删除失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }
    getTeam = (teamId) => {
        if (this.state.data == null) {
            return null;
        }
        const againstTeams = this.state.data.againstTeams;
        let team = null;
        let againstIndex = null;
        if (againstTeams != null) {
            const keys = Object.keys(againstTeams);
            keys.forEach(key => {
                const againstTeam = againstTeams[key];
                if (againstTeam && againstTeam.hostTeam && againstTeam.hostTeam.id && teamId == againstTeam.hostTeam.id) {
                    team = againstTeam.hostTeam;
                    againstIndex = key;
                } else if (againstTeam && againstTeam.guestTeam && againstTeam.guestTeam.id && teamId == againstTeam.guestTeam.id) {
                    team = againstTeam.guestTeam;
                    againstIndex = key;
                }
            })
        }
        return {team: team, againstIndex: againstIndex}
    }
    getPlayer = (id) => {
        const playerMap = this.state.playerList;
        return playerMap[id]
    }
    onDeleteAllTimeline = () => {
        deleteTimelineByMatchId({matchId: this.state.data.id, isStatistics: true}).then((data) => {
            if (data && data.code == 200) {
                if (data.data) {
                    message.success("删除成功");
                    this.refreshTimeLine()
                    this.props.refreshFuc();
                } else {
                    message.warn("删除成功");
                    this.refreshTimeLine()
                    this.props.refreshFuc();
                }
            } else {
                message.error('删除失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }

    render() {
        const {visible, form, record, responsive} = this.props;
        const onTimelineAddClick = this.onTimelineAddClick;
        const onDrawClose = this.onDrawClose;
        const onDrawHeightChange = this.onDrawHeightChange;
        const initTimeLineDom = this.initTimeLineDom;
        const refreshTimeLine = this.refreshTimeLine;
        const matchStatus = this.state.status;
        const isMobile = this.props.responsive.data.isMobile;

        return visible ?
            <div>
                <div className="step-delete-item">
                    <Popconfirm
                        title={"确定要清空全部事件吗?"}
                        onConfirm={this.onDeleteAllTimeline} okText="是" cancelText="否">
                        <Button icon="delete" shape="circle" type="danger"/>
                    </Popconfirm>
                </div>
                {this.state.data && this.getMatchAgainstDom(this.state.data)}
                <div className="center w-full mt-s">
                    <span>{matchStatus && matchStatus.status != -1 ? status[matchStatus.status].text : "未开"}</span>
                </div>
                <div className="center w-full mt-s">
                    <span>{matchStatus && matchStatus.section ? `第${matchStatus.section}节` : null}</span>
                </div>
                {this.state.teamStatistics && this.getTeamStatisticsDom()}
                <div className="mt-l">
                    {this.state.playerStatistics && this.state.playerStatistics.length > 0 ?
                        <List
                            header={<div className="w-full" style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end"
                            }}>
                                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>三分</div>
                                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>两分</div>
                                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>罚球</div>
                                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>犯规</div>
                                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>抢断</div>
                                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>篮板</div>
                                <div className="ml-l" style={{width: "40px", textAlign: "center"}}>助攻</div>
                            </div>}
                            bordered
                            size="small"
                            itemLayout="horizontal"
                            dataSource={this.state.playerStatistics}
                            renderItem={(item, index) => (
                                <List.Item key={`player-item-${index}`}>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                src={item.player && item.player.headImg ? item.player.headImg : defultAvatar}/>
                                        }
                                        title={item.player ? item.player.name : "未知"}
                                    />
                                    <div className="ml-l"
                                         style={{width: "40px", textAlign: "center"}}>{`${item[6] ? item[6] : 0}`}</div>
                                    <div className="ml-l"
                                         style={{width: "40px", textAlign: "center"}}>{`${item[7] ? item[7] : 0}`}</div>
                                    <div className="ml-l"
                                         style={{width: "40px", textAlign: "center"}}>{`${item[8] ? item[8] : 0}`}</div>
                                    <div className="ml-l"
                                         style={{width: "40px", textAlign: "center"}}>{`${item[9] ? item[9] : 0}`}</div>
                                    <div className="ml-l"
                                         style={{
                                             width: "40px",
                                             textAlign: "center"
                                         }}>{`${item[16] ? item[16] : 0}`}</div>
                                    <div className="ml-l"
                                         style={{
                                             width: "40px",
                                             textAlign: "center"
                                         }}>{`${item[17] ? item[17] : 0}`}</div>
                                    <div className="ml-l"
                                         style={{
                                             width: "40px",
                                             textAlign: "center"
                                         }}>{`${item[18] ? item[18] : 0}`}</div>
                                </List.Item>
                            )}
                        /> : null}
                </div>
                <Timeline className="mt-l" mode="alternate">
                    <Timeline.Item className="timeline-left mb-l"
                                   dot={<Button icon="plus" shape="circle" size="small"
                                                onClick={onTimelineAddClick}/>}/>
                    {initTimeLineDom()}
                </Timeline>
                <Drawer
                    className="ant-drawer-body-pa-s"
                    title="添加事件"
                    placement="bottom"
                    onClose={onDrawClose}
                    visible={this.state.drawVisible}
                    destroyOnClose={true}
                    height={this.state.drawHeight}
                >
                    <OneyuanMatchStatisticsAddDialog visible={this.state.drawVisible}
                                                        onHeightChange={onDrawHeightChange}
                                                        matchId={this.props.matchId}
                                                        data={this.state.data}
                                                        onClose={onDrawClose}
                                                        onSuccess={refreshTimeLine}
                                                        againstIndex={matchStatus ? matchStatus.againstIndex : null}
                                                        section={matchStatus ? matchStatus.section : null}
                    />
                </Drawer>
                <Modal
                    className={isMobile ? "top-n" : ""}
                    title="确认删除"
                    visible={this.state.deleteVisible}
                    onOk={this.handleDeleteOK}
                    onCancel={this.handleDeleteCancel}
                    zIndex={1001}
                >
                    <span className="mb-n" style={{fontSize: 14}}>是否确认删除？</span>
                </Modal>
            </div> : null
    }
}

const mapStateToProps = state => {
    const {auth = {data: {}}, responsive = {data: {}}} = state.httpData;
    return {auth, responsive};
};
const mapDispatchToProps = dispatch => ({
    receiveData: bindActionCreators(receiveData, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanMatchScoreDialog);