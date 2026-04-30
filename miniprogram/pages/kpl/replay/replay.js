// L5 复盘详情
Page({
  data: { id: '', game: '', detail: null },
  onLoad(opt) {
    this.setData({
      id: opt.id || '', game: opt.game || '1',
      detail: {
        duration: '23:45',
        kills: '21-12',
        gold: '62.5K-54.2K',
        firstBlood: '2:30 (清融击杀诺言)',
        firstTower: '6:48 (AG)',
        firstDragon: '8:12 (AG)',
        objectives: [
          { time: '02:30', desc: '清融gank中路一血' },
          { time: '06:48', desc: 'AG拿下下路一塔' },
          { time: '08:12', desc: 'AG拿下首条暴君' },
          { time: '14:50', desc: 'eStar抢龙团失败 0-3' },
          { time: '19:20', desc: '清融大龙团一打四翻盘' },
          { time: '23:45', desc: 'AG推掉水晶获胜' }
        ],
        analysis: 'AG超玩会本局打野清融选用澜，前期通过持续gank建立节奏。eStar在14分团战决策失误，AG抓住机会拿下大龙完成滚雪球。'
      }
    });
  }
});
