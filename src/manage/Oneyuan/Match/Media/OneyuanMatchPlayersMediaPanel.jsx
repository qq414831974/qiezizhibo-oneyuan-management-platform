import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {receiveData} from "../../../../action";
import {Row, Col, Card, Tooltip, Tag, List, Button, Modal, Avatar, Select, Spin,} from 'antd';
import {
    getMatchPlayersByTeamId,
    getMatchById,
    getMatchMedia, modifyMedia, deleteMediaToPlayer
} from "../../../../axios";
import defultAvatar from '../../../../static/avatar.jpg';
import shirt from '../../../../static/shirt.png';
import shirt2 from '../../../../static/shirt2.png';
import {Form, message} from "antd/lib/index";
import {Link} from 'react-router-dom';
import moment from "moment/moment";
import VideoPlayer from "../../../Live/VideoPlayer";
import nopic from '../../../../static/nopic.png';
import OneyuanPlayerModifyMediaDialog from "../../Player/OneyuanPlayerModifyMediaDialog";
import copy from "copy-to-clipboard/index";

const Option = Select.Option;

const ZHUCHANG = 1;
const KECHANG = 0;

class OneyuanMatchPlayersMediaPanel extends React.Component {
    state = {
        playerInfo: {},
        pageLoaded: false,
        againstPlayers: {}
    }

    componentDidMount() {
        if (!this.props.visible) {
            return;
        }
        this.fetch();
    };

    fetch = () => {
        this.setState({
            pageLoaded: false,
        });
        getMatchById(this.props.matchId).then((data) => {
            if (data && data.code == 200) {
                this.setState({
                    data: data.data,
                });
                this.fetchTeam(data.data)
                getMatchMedia({pageNum: 1, pageSize: 100, matchId: this.props.matchId}).then(data => {
                    if (data && data.code == 200) {
                        this.setState({mediaList: data.data ? data.data : []});
                    }
                })
            } else {
                message.error('获取比赛失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }
    fetchTeam = (match) => {
        const againstTeams = match.againsts;
        if (againstTeams != null) {
            const keys = Object.keys(againstTeams);
            keys.forEach(key => {
                const againstTeam = againstTeams[key];
                if (againstTeam.hostTeamId) {
                    getMatchPlayersByTeamId(null, againstTeam.hostTeamId).then((data) => {
                        if (data && data.code == 200) {
                            const againstPlayers = this.state.againstPlayers
                            if (againstPlayers[key] == null) {
                                againstPlayers[key] = {}
                            }
                            againstPlayers[key].host = data.data.records;
                            this.setState({againstPlayers: againstPlayers})
                        } else {
                            message.error('获取队员失败：' + (data ? data.result + "-" + data.message : data), 3);
                        }
                    });
                }
                if (againstTeam.guestTeamId) {
                    getMatchPlayersByTeamId(null, againstTeam.guestTeamId).then((data) => {
                        if (data && data.code == 200) {
                            const againstPlayers = this.state.againstPlayers
                            if (againstPlayers[key] == null) {
                                againstPlayers[key] = {}
                            }
                            againstPlayers[key].guest = data.data.records;
                            this.setState({againstPlayers: againstPlayers})
                        } else {
                            message.error('获取队员失败：' + (data ? data.result + "-" + data.message : data), 3);
                        }
                    });
                }
            })
        }
    }
    refresh = () => {
        this.fetch();
        this.setState({percent: null});
    }

    handleModifyMediaCancel = () => {
        this.setState({modifyMediaVisible: false});
    }
    saveModifyMeidaDialogRef = (form) => {
        this.modifyMeidaForm = form;
    }
    handleMediaDelete = (record) => {
        this.setState({deleteVisible: true, currentMedia: record});
    }
    handleDeleteCancel = () => {
        this.setState({deleteVisible: false});
    }
    handleModifyMediaOK = () => {
        const form = this.modifyMeidaForm;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            modifyMedia(values).then((data) => {
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
            this.setState({modifyMediaVisible: false});
        });
    }
    onMeidaClick = (record) => {
        this.setState({currentMedia: record, modifyMediaVisible: true});
    }
    handleDownload = (record) => {
        copy(record.path);
        message.success('下载地址已复制到剪贴板', 1);
    }
    showVideoPlayDialog = (record) => {
        this.setState({
            dialogPlayVisible: true,
            currentMedia: record
        });
    }
    handleVideoPlayDialogCancel = () => {
        this.setState({
            dialogPlayVisible: false,
        });
    }
    handleDeleteOK = () => {
        this.state.currentMedia &&
        deleteMediaToPlayer({
            playerId: this.state.currentMedia.playerId,
            mediaId: this.state.currentMedia.id,
        }).then(data => {
            this.setState({deleteVisible: false, modifyMediaVisible: false});
            if (data && data.code == 200) {
                if (data.data) {
                    message.success('删除成功', 1);
                    this.refresh();
                } else {
                    message.warn(data.message, 1);
                }
            } else {
                message.error('删除失败：' + (data ? data.result + "-" + data.message : data), 3);
            }
        });
    }
    getTeamDom = () => {
        if (this.state.data != null && this.state.data.againstTeams != null) {
            const againstTeams = this.state.data.againstTeams;
            console.log(againstTeams)
            console.log(this.state.againstPlayers)
            let dom = [];
            Object.keys(againstTeams).forEach(key => {
                const againstTeam = againstTeams[key];
                let teamDom = <div key={`team-${key}`} className="border-gray border-radius-10px mt-s">
                    <div className="w-full center mt-s">
                        对阵方{key}
                    </div>
                    <Row gutter={8}>
                        <Col span={12}>
                            <div>
                                <div className="center">
                                    <img className="round-img-xs"
                                         src={againstTeam.hostTeam ? againstTeam.hostTeam.headImg : defultAvatar}/>
                                </div>
                                <div className="center w-full">
                                    <p style={{fontSize: 12}}
                                       className="mt-s mb-n">{againstTeam.hostTeam ? againstTeam.hostTeam.name : ""}</p>
                                </div>
                                <div>
                                    {this.getTeamPlayerDom(key, true)}
                                </div>
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className="center">
                                <img className="round-img-xs"
                                     src={againstTeam.guestTeam ? againstTeam.guestTeam.headImg : defultAvatar}/>
                            </div>
                            <div className="center w-full">
                                <p style={{fontSize: 12}}
                                   className="mt-s mb-n">{againstTeam.guestTeam ? againstTeam.guestTeam.name : ""}</p>
                            </div>
                            <div>
                                {this.getTeamPlayerDom(key, false)}
                            </div>
                        </Col>
                    </Row>
                </div>;
                dom.push(teamDom);
            })
            return dom;
        }
        return null;
    }
    getTeamPlayerDom = (key, isHost) => {
        let dom = [];
        if (this.state.againstPlayers && this.state.againstPlayers[key]) {
            const againstPlayer = this.state.againstPlayers[key];
            if (againstPlayer) {
                const hostPlayer = againstPlayer.host;
                const guestPlayer = againstPlayer.guest;
                if (hostPlayer && isHost) {
                    dom.push(this.getPlayerDom(hostPlayer))
                } else if (guestPlayer && !isHost) {
                    dom.push(this.getPlayerDom(guestPlayer))
                }
            }
        }
        return dom;
    }
    getPlayerDom = (data) => {
        let dom = [];
        data && data.forEach(item => {
            dom.push(<Link to={
                `/oneyuan/oneyuanPlayer/${item.id}?matchId=${this.props.matchId}`
            }>
                <div className="inline-block cell-hover border-radius-10px border-gray pa-xs ml-s cursor-hand">
                    <Avatar src={item.headImg ? item.headImg : defultAvatar}/>
                    <span>{`${item.name}(${item.shirtNum})`}</span>
                </div>
            </Link>);
        });
        return <div className="inline">{dom}</div>;
    }

    render() {
        const isMobile = this.props.responsive.data.isMobile;

        const videoJsOptions = {
            autoplay: false,
            controls: true,
            width: 468,
            preload: "auto",
            poster: this.state.currentMedia ? this.state.currentMedia.poster : "",
            sources: [{
                type: "video/mp4",
                src: this.state.currentMedia ? this.state.currentMedia.path : "",
            }]
        }
        const ModifyMediaDialog = Form.create()(OneyuanPlayerModifyMediaDialog);

        return <div>
            {this.getTeamDom()}
            <Card className="mt-m" style={{minHeight: 559}}>
                <List
                    rowKey={record => record.id}
                    grid={{gutter: 16, lg: 3, md: 2, xs: 1}}
                    dataSource={this.state.mediaList ? this.state.mediaList.map(media => {
                        media.media.player = media.player;
                        media.media.playerId = media.playerId;
                        media.media.match = media.match;
                        media.media.matchId = media.matchId;
                        return media.media;
                    }) : []}
                    loading={this.state.mediaLoading}
                    renderItem={item => (<List.Item>
                        <div className="video-list-item pa-xs" style={{transform: "translate(0px, 0px)"}}>
                            <div className="video-list-item-top-left">
                                <Avatar
                                    src={item.player ? (item.player.headImg ? item.player.headImg : defultAvatar) : defultAvatar}/>
                                <span>{`${item.player ? item.player.name : ""}`}</span>
                            </div>
                            <img className="video-list-item-img"
                                 src={item.poster ? item.poster : nopic}/>
                            <div className="video-list-item-buttons center h-full">
                                <Button shape="circle" icon="download"
                                        className="video-list-item-button"
                                        onClick={this.handleDownload.bind(this, item)}/>
                                <Button shape="circle"
                                        icon="play-circle"
                                        className="video-list-item-button"
                                        onClick={this.showVideoPlayDialog.bind(this, item)}/>
                                <Button shape="circle" icon="bars"
                                        className="video-list-item-button"
                                        onClick={this.onMeidaClick.bind(this, item)}/>
                                {/*<Button shape="circle" icon="delete" className="video-list-item-button"*/}
                                {/*onClick={this.handleMediaDelete.bind(this, item)}/>*/}
                            </div>
                            <div className="video-list-item-bottom center">
                                <p className="video-list-item-bottom-text">上传时间：{moment(item.createTime).format("MM-DD HH:mm")}</p>
                            </div>
                        </div>
                    </List.Item>)}
                />
            </Card>
            <Modal
                className={isMobile ? "top-n" : ""}
                title="编辑视频"
                okText="确定"
                visible={this.state.modifyMediaVisible}
                onOk={this.handleModifyMediaOK}
                onCancel={this.handleModifyMediaCancel}
                zIndex={1001}
                destroyOnClose="true"
                footer={[
                    <Button key="delete" type="danger" className="pull-left"
                            onClick={this.handleMediaDelete.bind(this, this.state.currentMedia)}>删除</Button>,
                    <Button key="back" onClick={this.handleModifyMediaCancel}>取消</Button>,
                    <Button key="submit" type="primary" onClick={this.handleModifyMediaOK}>
                        确定
                    </Button>
                ]}
            >
                <ModifyMediaDialog
                    visible={this.state.modifyMediaVisible}
                    record={this.state.currentMedia}
                    playerId={this.state.currentMedia ? this.state.currentMedia.playerId : {}}
                    player={this.state.currentMedia ? this.state.currentMedia.player : {}}
                    ref={this.saveModifyMeidaDialogRef}/>
            </Modal>
            <Modal
                title="视频播放"
                visible={this.state.dialogPlayVisible}
                destroyOnClose="true"
                footer={[
                    <Button key="back" onClick={this.handleVideoPlayDialogCancel}>取消</Button>,
                ]}
                onCancel={this.handleVideoPlayDialogCancel}>
                <VideoPlayer {...videoJsOptions}/>
            </Modal>
            <Modal
                className={isMobile ? "top-n" : ""}
                title="确认删除"
                visible={this.state.deleteVisible}
                onOk={this.handleDeleteOK}
                onCancel={this.handleDeleteCancel}
                zIndex={1001}
            >
                <p className="mb-n" style={{fontSize: 14}}>是否确认删除？</p>
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

export default connect(mapStateToProps, mapDispatchToProps)(OneyuanMatchPlayersMediaPanel);