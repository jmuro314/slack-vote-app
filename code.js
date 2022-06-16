const token = PropertiesService.getScriptProperties().getProperty("SLACK_TOKEN");

function doPost(e) {
    if (e.parameter.payload) {
        // slackからのPOSTにpayloadがある場合
        actionVote(JSON.parse(e.parameter.payload))
    } else {
        // /voteの実行にはPOSTにpayloadがない
        createVote(e.parameter);
    }
    // slackに警告が出るため
    return ContentService.createTextOutput("");
}

function createVote(json) {
    const url = "https://slack.com/api/chat.postMessage";
    Logger.log(json);
    const channelId = json.channel_id;
    const user = json.user_id;
    const blocks = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "`0`"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "月",
                    "emoji": true
                },
                "value": "monday",
                "action_id": "monday"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "`0`"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "火",
                    "emoji": true
                },
                "value": "tuesday",
                "action_id": "tuesday"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "`0`"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "水",
                    "emoji": true
                },
                "value": "wednesday",
                "action_id": "wednesday"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "`0`"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "木",
                    "emoji": true
                },
                "value": "thursday",
                "action_id": "thursday"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "`0`"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "金",
                    "emoji": true
                },
                "value": "friday",
                "action_id": "friday"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "create by <@" + user + ">"
            }
        }
    ];

    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Bearer " + token
    };
    const payload = {
        "channel": channelId,
        "blocks": blocks
    };
    const params = {
        "method": "POST",
        "headers": headers,
        "payload": JSON.stringify(payload)
    };

    UrlFetchApp.fetch(url, params);
}

function actionVote(json) {
    const url = "https://slack.com/api/chat.update";
    const user = json.user.id;
    const actionWeekday = json.actions[0].action_id;
    const channelId = json.channel.id;
    const ts = json.message.ts;
    let blocks = json.message.blocks;

    let idx = -1
    if (actionWeekday == "monday") {
        idx = 0;
    } else if (actionWeekday == "tuesday") {
        idx = 1;
    } else if (actionWeekday == "wednesday") {
        idx = 2;
    } else if (actionWeekday == "thursday") {
        idx = 3;
    } else if (actionWeekday == "friday") {
        idx = 4;
    }

    // 投票人数を取得
    const userNumber = blocks[idx].text.text.slice(1, 2);
    if (blocks[idx].text.text.indexOf(user) != -1) {
        // 既に投票されている場合、ユーザを削除して投票人数を減らす
        const reg = ", <@" + user + ">";
        blocks[idx].text.text = blocks[idx].text.text.replace(new RegExp(reg, "g"), "");
        blocks[idx].text.text = blocks[idx].text.text.replace(/[0-9]/, Number(userNumber) - 1);
    } else {
        // まだ投票されていない場合、ユーザを追加し投票人数を増やす
        blocks[idx].text.text += ", <@" + user + ">";
        blocks[idx].text.text = blocks[idx].text.text.replace(/[0-9]/, Number(userNumber) + 1);
    }

    const headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Bearer " + token
    };
    const payload = {
        "channel": channelId,
        "ts": ts,
        "blocks": blocks
    };
    const params = {
        "method": "POST",
        "headers": headers,
        "payload": JSON.stringify(payload)
    };

    UrlFetchApp.fetch(url, params);
}
