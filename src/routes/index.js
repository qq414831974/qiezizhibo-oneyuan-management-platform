import React, {Component} from 'react';
// import { Router, Route, hashHistory, IndexRedirect } from 'react-router';
import {Route, Redirect, Switch} from 'react-router-dom';
import AdminUserManagement from '../manage/AdminUser/UserManagement';
import UserManagement from '../manage/User/UserManagement';
import UserDetailManagement from '../manage/User/UserDetailManagement';
import ExpManagement from '../manage/Exp/ExpManagement';
import GrowthManagement from '../manage/Growth/GrowthManagement';
import OneyuanPlayerManagement from "../manage/Oneyuan/Player/OneyuanPlayerManagement";
import OneyuanPlayerDetailManagement from "../manage/Oneyuan/Player/OneyuanPlayerDetailManagement";
import LiveManagement from "../manage/Live/LiveManagement";
import LiveDetailManagement from "../manage/Live/LiveDetailManagement";
import OneyuanTeamManagement from "../manage/Oneyuan/Team/OneyuanTeamManagement";
import TeamDetailManagement from "../manage/Oneyuan/Team/OneyuanTeamDetailManagement";
import OneyuanMatchManagement from "../manage/Oneyuan/Match/OneyuanMatchManagement";
import MatchDetailManagement from "../manage/Oneyuan/Match/OneyuanMatchDetailManagement";
import OneyuanLeagueMatchManagement from "../manage/Oneyuan/League/OneyuanLeagueMatchManagement";
import OneyuanLeagueMatchSeriesManagement from "../manage/Oneyuan/League/Series/OneyuanLeagueMatchSeriesManagement";
import OneyuanLeagueMatchDetailManagement from "../manage/Oneyuan/League/OneyuanLeagueMatchDetailManagement";
import ImportManagement from "../manage/Oneyuan/Import/ImportManagement";
import RoleManagement from "../manage/Role/RoleManagement";
import PermissionManagement from "../manage/Permission/PermissionManagement";
import AreasManagement from "../manage/Areas/AreasManagement";
import CommentManagement from "../manage/Comment/CommentManagement";
import Dashboard from "../manage/Dashboard/Dashboard";
import BannerSetting from "../manage/Setting/Banner/BannerSetting";
import BulletinSetting from "../manage/Setting/Bulletin/BulletinSetting";
import WechatSetting from "../manage/Setting/WechatSetting";
import OneyuanMatchSchedule from "../manage/Oneyuan/Match/OneyuanMatchSchedule";
import ProductManagement from "../manage/Pay/Product/ProductManagement";
import OrderManagement from "../manage/Pay/Order/OrderManagement";
import CashManagement from "../manage/Pay/Cash/CashManagement";
import FreeTicketManagement from "../manage/Pay/FreeTicket/FreeTicketManagement";
import DepositManagement from "../manage/Pay/Deposit/DepositManagement";
import MatchMonopolyManagement from "../manage/Pay/Monopoly/MatchMonopolyManagement";
import ShareSentenceManagement from "../manage/Setting/ShareSentence/ShareSentenceManagement";
import GiftManagement from "../manage/Pay/Gift/GiftManagement";
import OneyuanLeagueChargeManagement from "../manage/Oneyuan/Charge/League/OneyuanLeagueChargeManagement";
import OneyuanMatchChargeManagement from "../manage/Oneyuan/Charge/Match/OneyuanMatchChargeManagement";
import OneyuanLeagueHeatManagement from "../manage/Oneyuan/Heat/League/OneyuanLeagueHeatManagement";
import OneyuanMatchHeatManagement from "../manage/Oneyuan/Heat/Match/OneyuanMatchHeatManagement";
import OneyuanLeagueBetManagement from "../manage/Oneyuan/Bet/League/OneyuanLeagueBetManagement";
import OneyuanMatchBetManagement from "../manage/Oneyuan/Bet/Match/OneyuanMatchBetManagement";
import UserBetManagement from "../manage/Oneyuan/Bet/UserBetManagement";
import OneyuanLeagueClipManagement from "../manage/Oneyuan/Clip/League/OneyuanLeagueClipManagement";
import OneyuanMatchClipManagement from "../manage/Oneyuan/Clip/Match/OneyuanMatchClipManagement";
import OneyuanLeagueAdManagement from "../manage/Oneyuan/Ad/League/OneyuanLeagueAdManagement";
import OneyuanLeagueEncryptionManagement from "../manage/Oneyuan/Encryption/League/OneyuanLeagueEncryptionManagement";
import OneyuanMatchEncrypitonManagement from "../manage/Oneyuan/Encryption/Match/OneyuanMatchEncryptionManagement";
import OneyuanLeagueStatisticsManagement from "../manage/Oneyuan/Statistics/OneyuanLeagueStatisticsManagement";
import OneyuanLeagueRegistrationManagement from "../manage/Oneyuan/Registration/OneyuanLeagueRegistrationManagement";
import TeamRegistrationManagement from "../manage/Oneyuan/Registration/Team/TeamRegistrationManagement";
import PlayerRegistrationManagement from "../manage/Oneyuan/Registration/Player/PlayerRegistrationManagement";
import OneyuanLeagueMatchBillAnalysis from "../manage/Oneyuan/League/Bill/OneyuanLeagueMatchBillAnalysis";
import OneyuanLeagueDetailSetting from "../manage/Oneyuan/League/Detail/OneyuanLeagueDetailSetting";
import PaymentConfigManagement from "../manage/Setting/Payment/PaymentConfigManagement";
import Unauthorized from '../manage/Pages/Unauthorized';
import LogManagement from '../manage/Log/LogManagement';
import FeedbackManagement from '../manage/Setting/Feedback/FeedbackManagement';

var UrlPattern = require('url-pattern');

export default class CRouter extends Component {
    requireAuth = (url, component) => {
        const page401 = Unauthorized;
        const {permissions} = this.props;
        if (permissions) {
            let vaild = false;
            for (let permission of permissions) {
                if(permission){
                    var pattern = new UrlPattern(permission);
                    if (pattern.match(url)) {
                        vaild = true;
                        break;
                    }
                }
            }
            if (vaild) {
                return component
            } else {
                return page401
            }
        }
        return page401;
    };

    render() {
        return (
            <Switch>
                <Route exact path="/index" component={Dashboard}/>
                <Route exact path="/user/user" component={this.requireAuth("/user/user" ,UserManagement)}/>
                <Route exact path="/user/admin" component={this.requireAuth("/user/admin",AdminUserManagement)}/>
                <Route exact path="/exp/exp" component={this.requireAuth("/exp/exp",ExpManagement)}/>
                <Route exact path="/exp/growth" component={this.requireAuth("/exp/growth",GrowthManagement)}/>
                <Route exact path="/role/role" component={this.requireAuth("/role/role",RoleManagement)}/>
                <Route exact path="/role/permission" component={this.requireAuth("/role/permission",PermissionManagement)}/>
                <Route exact path="/area" component={this.requireAuth("/area",AreasManagement)}/>
                <Route exact path="/oneyuan/oneyuanPlayer" component={this.requireAuth("/oneyuan/oneyuanPlayer",OneyuanPlayerManagement)}/>
                <Route exact path="/oneyuan/oneyuanTeam" component={this.requireAuth("/oneyuan/oneyuanTeam",OneyuanTeamManagement)}/>
                <Route exact path="/oneyuan/oneyuanMatch" component={this.requireAuth("/oneyuan/oneyuanMatch",OneyuanMatchManagement)}/>
                <Route exact path="/oneyuan/oneyuanLeagueMatch" component={this.requireAuth("/oneyuan/oneyuanLeagueMatch",OneyuanLeagueMatchManagement)}/>
                <Route exact path="/live" component={this.requireAuth("/live",LiveManagement)}/>
                <Route exact path="/setting/banner" component={this.requireAuth("/setting/banner",BannerSetting)}/>
                <Route exact path="/setting/wechat" component={this.requireAuth("/setting/wechat",WechatSetting)}/>
                <Route exact path="/setting/bulletin" component={this.requireAuth("/setting/bulletin",BulletinSetting)}/>
                <Route exact path="/setting/sharesentence" component={this.requireAuth("/setting/sharesentence",ShareSentenceManagement)}/>
                <Route exact path="/setting/payment" component={this.requireAuth("/setting/payment",PaymentConfigManagement)}/>
                <Route exact path="/pay/product" component={this.requireAuth("/pay/product",ProductManagement)}/>
                <Route exact path="/pay/order" component={this.requireAuth("/pay/order",OrderManagement)}/>
                <Route exact path="/pay/cash" component={this.requireAuth("/pay/cash",CashManagement)}/>
                <Route exact path="/pay/freeTicket" component={this.requireAuth("/pay/freeTicket",FreeTicketManagement)}/>
                <Route exact path="/pay/monopoly" component={this.requireAuth("/pay/monopoly",MatchMonopolyManagement)}/>
                <Route exact path="/pay/gift" component={this.requireAuth("/pay/gift",GiftManagement)}/>
                <Route exact path="/pay/deposit" component={this.requireAuth("/pay/deposit",DepositManagement)}/>
                <Route exact path="/oneyuan/import" component={this.requireAuth("/oneyuan/import",ImportManagement)}/>
                <Route exact path="/oneyuan/league/charge" component={this.requireAuth("/oneyuan/league/charge",OneyuanLeagueChargeManagement)}/>
                <Route exact path="/oneyuan/match/charge" component={this.requireAuth("/oneyuan/match/charge",OneyuanMatchChargeManagement)}/>
                <Route exact path="/oneyuan/league/heat" component={this.requireAuth("/oneyuan/league/heat",OneyuanLeagueHeatManagement)}/>
                <Route exact path="/oneyuan/match/heat" component={this.requireAuth("/oneyuan/match/heat",OneyuanMatchHeatManagement)}/>
                <Route exact path="/oneyuan/league/bet" component={this.requireAuth("/oneyuan/league/bet",OneyuanLeagueBetManagement)}/>
                <Route exact path="/oneyuan/match/bet" component={this.requireAuth("/oneyuan/match/bet",OneyuanMatchBetManagement)}/>
                <Route exact path="/oneyuan/league/clip" component={this.requireAuth("/oneyuan/league/clip",OneyuanLeagueClipManagement)}/>
                <Route exact path="/oneyuan/match/clip" component={this.requireAuth("/oneyuan/match/clip",OneyuanMatchClipManagement)}/>
                <Route exact path="/oneyuan/league/encryption" component={this.requireAuth("/oneyuan/league/encryption",OneyuanLeagueEncryptionManagement)}/>
                <Route exact path="/oneyuan/match/encryption" component={this.requireAuth("/oneyuan/match/encryption",OneyuanMatchEncrypitonManagement)}/>
                <Route exact path="/oneyuan/league/ad" component={this.requireAuth("/oneyuan/league/ad",OneyuanLeagueAdManagement)}/>
                <Route exact path="/oneyuan/league/registration" component={this.requireAuth("/oneyuan/league/registration",OneyuanLeagueRegistrationManagement)}/>
                <Route exact path="/oneyuan/league/registration/team" component={this.requireAuth("/oneyuan/league/registration/team",TeamRegistrationManagement)}/>
                <Route exact path="/oneyuan/league/registration/player" component={this.requireAuth("/oneyuan/league/registration/player",PlayerRegistrationManagement)}/>
                <Route exact path="/oneyuan/league/statistics" component={this.requireAuth("/oneyuan/league/statistics",OneyuanLeagueStatisticsManagement)}/>
                <Route exact path="/pay/bet" component={this.requireAuth("/pay/bet",UserBetManagement)}/>
                <Route path="/oneyuan/comment/:id" component={this.requireAuth("/oneyuan/comment/:id",CommentManagement)}/>
                <Route path="/live/:id" component={this.requireAuth("/live/:id",LiveDetailManagement)}/>
                <Route path="/user/user/:id" component={this.requireAuth("/user/user/:id" ,UserDetailManagement)}/>
                <Route path="/oneyuan/oneyuanTeam/:id" component={this.requireAuth("/oneyuan/oneyuanTeam/:id",TeamDetailManagement)}/>
                <Route path="/oneyuan/oneyuanMatch/:id" component={this.requireAuth("/oneyuan/oneyuanMatch/:id",MatchDetailManagement)}/>
                <Route path="/oneyuan/league/detail/:id" component={this.requireAuth("/oneyuan/oneyuanLeagueMatch/:id",OneyuanLeagueDetailSetting)}/>
                <Route path="/oneyuan/oneyuanLeagueMatch/:id" component={this.requireAuth("/oneyuan/oneyuanLeagueMatch/:id",OneyuanLeagueMatchDetailManagement)}/>
                <Route path="/oneyuan/oneyuanLeagueSeries/:id" component={this.requireAuth("/oneyuan/oneyuanLeagueSeries/:id",OneyuanLeagueMatchSeriesManagement)}/>
                <Route path="/oneyuan/oneyuanPlayer/:id" component={this.requireAuth("/oneyuan/oneyuanPlayer/:id",OneyuanPlayerDetailManagement)}/>
                <Route path="/oneyuan/schedule" component={this.requireAuth("/oneyuan/schedule",OneyuanMatchSchedule)}/>
                <Route path="/analysis/bill" component={this.requireAuth("/analysis/bill",OneyuanLeagueMatchBillAnalysis)}/>
                <Route path="/sys/log" component={this.requireAuth("/sys/log",LogManagement)}/>
                <Route path="/sys/feedback" component={this.requireAuth("/sys/feedback",FeedbackManagement)}/>
                <Route render={() => <Redirect to="/index"/>}/>
            </Switch>
        )
    }
}