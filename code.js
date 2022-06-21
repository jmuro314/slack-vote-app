const token = PropertiesService.getScriptProperties().getProperty("SLACK_TOKEN");

function doPost(e) {
  if (e.parameter.payload) {
    // slackからのPOSTにpayloadがある場合
    updateVote(JSON.parse(e.parameter.payload))
  } else {
    // /voteの実行にはPOSTにpayloadがない
    postVote(e.parameter);
  }
  
  // slackに警告が出るため
  return ContentService.createTextOutput("");
}

function postVote(json) {
  const url = "https://slack.com/api/chat.postMessage";
  const channelId = json.channel_id;
  const user = json.user_id;
  const text = json.text;
  let blocks = "";
  if (text == "") {
    blocks = createDefaultBlocks(user);
  } else {
    blocks = createCustomBlocks(user, text);
  }

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

function updateVote(json) {
  const url = "https://slack.com/api/chat.update";
  const user = json.user.id;
  const actionIdx = Number(json.actions[0].action_id);
  const channelId = json.channel.id;
  const ts = json.message.ts;
  let blocks = json.message.blocks;

  // 投票人数を取得
  const userNumber = blocks[actionIdx].text.text.slice(1, 2);
  if (blocks[actionIdx].text.text.indexOf(user) != -1) {
    // 既に投票されている場合、ユーザを削除して投票人数を減らす
    const reg = ", <@" + user + ">";
    blocks[actionIdx].text.text = blocks[actionIdx].text.text.replace(new RegExp(reg, "g"), "");
    blocks[actionIdx].text.text = blocks[actionIdx].text.text.replace(/[0-9]/, Number(userNumber) - 1);
  } else {
    // まだ投票されていない場合、ユーザを追加し投票人数を増やす
    blocks[actionIdx].text.text += ", <@" + user + ">";
    blocks[actionIdx].text.text = blocks[actionIdx].text.text.replace(/[0-9]/, Number(userNumber) + 1);
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

function createDefaultBlocks(user) {
  const blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Title here"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 月"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "1",
          "emoji": true
        },
        "action_id": "1"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 火"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "2",
          "emoji": true
        },
        "action_id": "2"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 水"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "3",
          "emoji": true
        },
        "action_id": "3"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 木"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "4",
          "emoji": true
        },
        "action_id": "4"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 金"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "5",
          "emoji": true
        },
        "action_id": "5"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "`0` 欠席"
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "6",
          "emoji": true
        },
        "action_id": "6"
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "create by <@" + user + ">"
        }
      ]
    }
  ];

  return blocks;
}

function createCustomBlocks(user, text) {
  const textArray = text.split(",");

  let blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Title here"
      }
    }
  ];
  const footer = {
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "create by <@" + user + ">"
      }
    ]
  };
  let option = {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "`0` option"
    },
    "accessory": {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": "1",
        "emoji": true
      },
      "action_id": "1"
    }
  };

  textArray.forEach((value, i) => {
    if (i == 0) {
      // タイトルを記入
      blocks[i].text.text = value;
      return;
    }
    option.text.text = "`0` " + value;
    option.accessory.text.text = String(i);
    option.accessory.action_id = String(i);
    // ディープコピーして追加
    let deep = JSON.parse(JSON.stringify(option));
    blocks.push(deep);
  });

  blocks.push(footer);

  return blocks;
}
