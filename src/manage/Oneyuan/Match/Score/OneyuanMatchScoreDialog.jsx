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
    Radio, Select, Popconfirm
} from 'antd';
import moment from 'moment'
import 'moment/locale/zh-cn';
import {receiveData} from "../../../../action";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import defultAvatar from '../../../../static/avatar.jpg';
import vs from '../../../../static/vs.png';
import finish from '../../../../static/finish.svg';
import flag from "../../../../static/flag.svg";
import section_pre from "../../../../static/section_pre.svg";
import section_next from "../../../../static/section_next.svg";
import ball from "../../../../static/ball.svg";
import ball2 from "../../../../static/ball2.svg";
import ball3 from "../../../../static/ball3.svg";
import switch_against from "../../../../static/switch_against.svg";
import {
    getTimelineByMatchId,
    getMatchStatus,
    getMatchById,
    getPlayersByTeamId,
    updateMatchById,
    updateMatchScoreStatusById, getMatchPlayersByTeamId, deleteTimelineByIds, deleteTimelineByMatchId,
} from "../../../../axios";
import OneyuanMatchScoreAddDialog from './OneyuanMatchScoreAddDialog';
import OneyuanMatchScoreTimeEventAddDialog from './OneyuanMatchScoreTimeEventAddDialog';
import {message} from "antd/lib/index";

const Option = Select.Option;

const status = {
    0: {text: "比赛开始"},
    21: {text: "比赛结束"},
};

const eventType = {
    0: {text: "比赛开始", icon: finish},
    1: {text: "一分球", icon: ball,},
    2: {text: "二分球", icon: ball2,},
    3: {text: "三分球", icon: ball3,},
    11: {text: "一分球撤销", icon: ball,},
    12: {text: "二分球撤销", icon: ball2,},
    13: {text: "三分球撤销", icon: ball3,},
    4: {text: "下一节", icon: section_next, hidden: true},
    5: {text: "切换对阵", icon: switch_against, hidden: true},
    14: {text: "上一节", icon: section_pre, hidden: true},
    21: {text: "比赛结束", icon: flag},
}
const statusEvent = [
    {key: 0, text: "比赛开始", icon: finish, show: 1},
    {key: 5, text: "切换对阵", icon: switch_against, show: 1},
    {key: 21, text: "比赛结束", icon: flag, show: 1},
    {key: 4, text: "下一节", icon: section_next, show: 1},
    {key: 14, text: "上一节", icon: section_pre, show: 1},
]
moment.locale('zh-cn');

class OneyuanMatchScoreDialog extends React.Component {
    state = {
        data: {},
        playerInfo: {},
        timeline: [],
        drawHeight: 270,
        drawEventHeight: 300,
        statusDialogScore: {},
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
                    // hostFormation: data.hostTeam?(data.hostTeam.formation ? data.hostTeam.formation.type : "4-3-3"):{},
                    // guestFormation: data.guestTeam?(data.guestTeam.formation ? data.guestTeam.formation.type : "4-3-3"):{}
                });
                this.getTimeline();
            } else {
                message.error('获取比赛失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }

    getTimeline = () => {
        getMatchStatus(this.props.matchId).then((res) => {
            if (res && res.code == 200) {
                this.setState({status: res.data, statusLoading: false});
                let timelines = res.data ? res.data.timeLines : [];
                this.setState({
                    timelineData: timelines,
                });
            } else {
                message.error('获取时间轴失败：' + (res ? res.result + "-" + res.message : res), 3);
            }
        });
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
                    const isGoal = item.eventType == 1 || item.eventType == 2 || item.eventType == 3 || item.eventType == 11 || item.eventType == 12 || item.eventType == 13
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
                    const {team} = this.getTeam(item.teamId)
                    let line = <Timeline.Item dot={dot} className={dis}>
                        <div style={{height: 36}} className="center pl-l inline-flex-important">
                            <span>{isGoal && item.remark ? `${item.remark}个` : null}</span>
                            {team ? <div className="ml-s">
                                <img src={team.headImg ? team.headImg : defultAvatar} className="round-img-xs"/>
                                <span>{team.name}{item.againstIndex ? `(对阵${item.againstIndex})` : null}</span>
                            </div> : null}
                        </div>
                    </Timeline.Item>
                    if (isHost) {
                        line = <Timeline.Item dot={dot} className={dis}>
                            <div style={{height: 36}} className="center pr-l inline-flex-important">
                                {team ? <div>
                                    <span>{item.againstIndex ? `(对阵${item.againstIndex})` : null}{team.name}</span>
                                    <img src={team.headImg ? team.headImg : defultAvatar} className="round-img-xs"/>
                                </div> : null}
                                <span className="ml-s">{isGoal && item.remark ? `${item.remark}个` : null}</span>
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
    onModifyDrawClose = () => {
        this.setState({
            drawModifyVisible: false,
            drawHeight: 270
        });
    };
    onEventAddDrawClose = () => {
        this.setState({
            drawEventAddVisible: false,
        });
    };
    onEventModifyDrawClose = () => {
        this.setState({
            drawEventModifyVisible: false,
        });
    };
    showEventAddDrawer = () => {
        this.setState({
            drawEventAddVisible: true,
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
    onDrawEventHeightChange = (height) => {
        this.setState({drawEventHeight: height})
    }
    getTimeOption = () => {
        let doms = [];
        let indes = 0;
        const onEventSelect = this.onEventSelect;
        const rowSize = 3;
        statusEvent.forEach((item, index) => {
            if (item.show == 1) {
                let row = Math.floor(indes / rowSize);
                let dom_div = (<Col span={Math.floor(24 / rowSize)}>
                    <div onClick={onEventSelect.bind(this, item)}
                         className="step-item-hover center">
                        <div style={{position: "relative"}}>
                            <div className="w-full center">
                                <img className="round-img-s" src={item.icon ? item.icon : defultAvatar}/>
                            </div>
                            <p className="w-full mb-n center">{item.text}</p>
                        </div>
                    </div>
                </Col>);
                if (!doms[row]) {
                    doms[row] = [];
                }
                doms[row].push(dom_div)
                indes = indes + 1;
            }
        });
        let dom = [];
        doms.forEach((item, index) => {
            dom.push(<Row className="w-full center" gutter={2}>{item}</Row>)
        });
        return <div>
            <span className="w-full mb-n center"
                  style={{fontSize: 20}}>选择事件</span>
            {dom}
        </div>;
    }
    onEventSelect = (item, e) => {
        this.setState({event: item});
        this.showEventAddDrawer();
    }
    refreshTimeLine = () => {
        this.getTimeline();
    }
    onStatusDialogRaidoChange = (e) => {
        this.setState({statusValue: e.target.value});
    }
    onStatusDialogScoreChange = (i, e) => {
        let statusDialogScore = this.state.statusDialogScore
        statusDialogScore[i] = e.target.value;
        this.setState({statusDialogScore: statusDialogScore});
    }
    onStatusDialogAgainstIndexChange = (e) => {
        this.setState({statusDialogAgainstIndex: e});
    }
    onStatusDialogSectionChange = (e) => {
        this.setState({statusDialogSection: e});
    }
    handleMatchStatusConfirm = () => {
        updateMatchScoreStatusById({
            matchId: this.state.data.id,
            status: this.state.statusValue,
            section: this.state.statusDialogSection,
            againstIndex: this.state.statusDialogAgainstIndex,
            score: this.state.statusDialogScore,
        }).then((data) => {
            if (data && data.code == 200) {
                if (data.data) {
                    this.fetch();
                    this.props.refreshFuc();
                    message.success('修改成功', 1);
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('修改失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
        this.setState({dialogStatusVisible: false});
    }
    showStatusDialog = () => {
        if (this.state.statusLoading || this.state.status == null) {
            return;
        }
        this.setState({
            dialogStatusVisible: true,
            statusValue: this.state.status.status,
            statusDialogSection: this.state.status.section,
            statusDialogScore: this.state.status.score,
            statusDialogAgainstIndex: this.state.status.againstIndex
        });
    }
    handleMatchStatusCancel = () => {
        this.setState({dialogStatusVisible: false});
    };
    getMatchAgainstDom = (match, handleClick, context) => {
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
                dom.push(<div key={`against-${<p className="ml-s">{hostTeam.name}</p>}`}
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
            if (handleClick == null) {
                return <span className="cursor-default">{match.name}</span>
            }
            return <span className="cursor-hand" onClick={handleClick.bind(context, match)}>{match.name}</span>
        }
        if (handleClick == null) {
            return <div className="w-full cursor-default">
                {dom}
            </div>;
        }
        return <div className="w-full cursor-hand" onClick={handleClick.bind(context, match)}>
            {dom}
        </div>;
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
    getScoreStatusModalContent = () => {
        let scoreDom = [];
        let againstOptionDom = [];
        let sectionOptionDom = [];
        if (this.state.data == null) {
            return null;
        }
        const sectionTotal = this.state.data.section;
        if (sectionTotal != null) {
            for (let i = 1; i <= sectionTotal; i++) {
                sectionOptionDom.push(<Option key={`sectionOption-${i}`} value={i}>
                    {`第${i}节`}
                </Option>)
            }
        }
        const againstMap = this.state.data.againstTeams;
        if (againstMap != null) {
            Object.keys(againstMap).forEach(key => {
                const hostTeam = againstMap[key].hostTeam;
                const guestTeam = againstMap[key].guestTeam;
                scoreDom.push(<div key={`againstScore-${key}`} className="w-full mt-s">
                    <div className="w-full center">
                        <span>{`对阵${key}：`}</span>
                        <span>{hostTeam.name}</span>
                        <img src={hostTeam.headImg ? hostTeam.headImg : defultAvatar} className="round-img-s"/>
                        <span>vs</span>
                        <img src={guestTeam.headImg ? guestTeam.headImg : defultAvatar} className="round-img-s"/>
                        <span>{guestTeam.name}</span>
                    </div>
                    <div className="w-full center mt-s">
                        <Input style={{minWidth: 300, textAlign: "center"}} placeholder={`对阵${key}比分`}
                               onChange={this.onStatusDialogScoreChange.bind(this, key)}
                               value={this.state.statusDialogScore[key]}/>
                    </div>
                </div>)
                againstOptionDom.push(<Option key={`againstOption-${key}`} value={Number(key)}>
                    <div className="w-full center">
                        <span>{`对阵${key}：`}</span>
                        <span>{hostTeam.name}</span>
                        <img src={hostTeam.headImg ? hostTeam.headImg : defultAvatar} className="round-img-s"/>
                        <span>vs</span>
                        <img src={guestTeam.headImg ? guestTeam.headImg : defultAvatar} className="round-img-s"/>
                        <span>{guestTeam.name}</span>
                    </div>
                </Option>)
            })
        }
        return <div>
            <div className="w-full center">
                <span className="mb-n mt-m" style={{fontSize: 20}}>状态</span>
            </div>
            <div className="w-full center">
                <Radio.Group className="mt-m" onChange={this.onStatusDialogRaidoChange}
                             value={this.state.statusValue}>
                    <Radio value={-1}>未开始</Radio>
                    <Radio value={0}>比赛开始</Radio>
                    <Radio value={21}>比赛结束</Radio>
                </Radio.Group>
            </div>
            <div className="w-full center">
                <span className="mb-n mt-m" style={{fontSize: 20}}>当前小节数</span>
            </div>
            <div className="w-full center pt-s">
                <Select style={{minWidth: 300}}
                        onChange={this.onStatusDialogSectionChange}
                        value={this.state.statusDialogSection}
                        placeholder="选择当前小节数">
                    {sectionOptionDom}
                </Select>
            </div>
            <div className="w-full center">
                <span className="mb-n mt-m" style={{fontSize: 20}}>当前对阵</span>
            </div>
            <div className="w-full center pt-s">
                <Select style={{minWidth: 300}}
                        onChange={this.onStatusDialogAgainstIndexChange}
                        value={this.state.statusDialogAgainstIndex}
                        placeholder="选择当前对阵方">
                    {againstOptionDom}
                </Select>
            </div>
            <div className="w-full center">
                <span className="mb-n mt-m" style={{fontSize: 20}}>比分</span>
            </div>
            {scoreDom}
        </div>
    }
    onDeleteAllTimeline = () => {
        deleteTimelineByMatchId({matchId: this.state.data.id}).then((data) => {
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
        const onEventAddDrawClose = this.onEventAddDrawClose;
        const onDrawHeightChange = this.onDrawHeightChange;
        const onDrawEventHeightChange = this.onDrawEventHeightChange;
        const getTimeOption = this.getTimeOption;
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
                {this.state.data && this.getMatchAgainstDom(this.state.data, this.showStatusDialog, this)}
                <div className="center w-full cursor-hand mt-s">
                    <Button loading={this.state.statusLoading} onClick={this.showStatusDialog}>
                        {matchStatus && matchStatus.status != -1 ? status[matchStatus.status].text : "未开"}
                    </Button>
                </div>
                <div className="center w-full cursor-hand mt-s">
                    <Button loading={this.state.statusLoading} onClick={this.showStatusDialog}>
                        {matchStatus && matchStatus.section ? `第${matchStatus.section}节` : null}
                    </Button>
                </div>
                <Timeline className="mt-l" mode="alternate">
                    {initTimeLineDom()}
                    {this.state.timeline}
                    <Timeline.Item className="timeline-left"
                                   dot={<Button icon="plus" shape="circle" size="small"
                                                onClick={onTimelineAddClick}/>}/>
                </Timeline>
                {getTimeOption()}
                <Drawer
                    className="ant-drawer-body-pa-s"
                    title="添加事件"
                    placement="bottom"
                    onClose={onDrawClose}
                    visible={this.state.drawVisible}
                    destroyOnClose={true}
                    height={this.state.drawHeight}
                >
                    <OneyuanMatchScoreAddDialog visible={this.state.drawVisible}
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
                <Drawer
                    className="ant-drawer-body-pa-s"
                    title="添加事件"
                    placement="bottom"
                    onClose={onEventAddDrawClose}
                    visible={this.state.drawEventAddVisible}
                    destroyOnClose={true}
                    height={this.state.drawEventHeight}
                >
                    <OneyuanMatchScoreTimeEventAddDialog visible={this.state.drawEventAddVisible}
                                                            matchId={this.props.matchId}
                                                            data={this.state.data}
                                                            onClose={onEventAddDrawClose}
                                                            onSuccess={refreshTimeLine}
                                                            event={this.state.event}
                                                            againstIndex={matchStatus ? matchStatus.againstIndex : null}
                                                            onHeightChange={onDrawEventHeightChange}
                    />
                </Drawer>
                <Modal
                    className={isMobile ? "top-n" : ""}
                    width={800}
                    visible={this.state.dialogStatusVisible}
                    title="比分状态设置"
                    okText="确定"
                    onCancel={this.handleMatchStatusCancel}
                    destroyOnClose="true"
                    footer={[
                        <Button key="submit" type="primary" onClick={this.handleMatchStatusConfirm}>确定</Button>,
                        <Button key="back" onClick={this.handleMatchStatusCancel}>取消</Button>,
                    ]}
                >
                    {this.getScoreStatusModalContent()}
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