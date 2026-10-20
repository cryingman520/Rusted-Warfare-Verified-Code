(function(){
const moduleHelp={
 core:['单位的基本信息','设置单位名称、生命值、造价和碰撞大小。先完成这里，再添加武器和动作。','Basic unit settings','Set the unit name, health, cost and collision size. Start here before adding weapons or actions.'],
 graphics:['单位长什么样','选择单位贴图、残骸和阴影，也可以调整图像大小和动画。','Unit appearance','Choose the unit sprite, wreck and shadow, and adjust size and animation.'],
 attack:['单位怎样攻击','开启攻击能力，选择可以攻击的目标，并设置射程和射击间隔。具体武器放在炮塔和射弹模块中。','Attack settings','Enable attacks, choose target types, and set range and firing delay. Add turrets and projectiles for individual weapons.'],
 movement:['单位怎样移动','选择陆地、空中或水上等移动方式，再调整速度和转向。','Movement','Choose a movement type, then set speed and turning.'],
 ai:['让电脑控制这个单位','告诉电脑玩家，这个单位适合建造、采集、运输还是进攻，以及应该建造多少。','AI behaviour','Tell AI players how to use this unit and how many to build.'],
 action:['给玩家一个操作按钮','为单位添加可点击的按钮，例如切换模式、升级或施放技能。设置按钮文字，再添加点击后执行的操作。','A button for the player','Add a button for a mode switch, upgrade or ability. Choose its text, then add what happens when it is used.'],
 hiddenAction:['让单位自动执行操作','隐藏动作不会显示为玩家按钮。它适合在单位出生、受到伤害或满足条件时自动执行，也可以由其他动作调用。','An action behind the scenes','Hidden actions do not appear as player buttons. Run them when the unit is created, damaged, or meets a condition, or call them from another action.'],
 turret:['添加一门武器','设置炮塔的位置、转向和使用的射弹。需要先开启单位的攻击能力，并创建对应的射弹模块。','Add a weapon','Set the turret position, rotation and projectile. Enable attacks and add a matching projectile module.'],
 projectile:['设置子弹和伤害','决定射弹的伤害、速度、飞行时间和爆炸效果，再让炮塔使用它。','Projectile and damage','Set damage, speed, lifetime and impact effects, then use this projectile in a turret.'],
 canBuild:['添加可建造的单位','把指定单位加入建造菜单，并设置显示位置、价格或解锁条件。','Build menu','Add units to the build menu and choose their order, price or unlock conditions.'],
 animation:['让单位动起来','设置动画的播放时机，并用关键帧控制身体、步足、炮塔或特效的变化。','Animate the unit','Choose when an animation plays and add keyframes for the body, legs, turrets or effects.'],
 effect:['制作视觉特效','设置烟雾、闪光、粒子等效果的图像、大小、颜色和持续时间。','Visual effects','Create smoke, flashes and particles with custom images, size, colour and lifetime.'],
 leg:['添加步足','设置步足的位置、贴图和行走动作。每条步足使用一个数字编号。','Walking legs','Set the position, images and movement of each leg. Use a number to identify each one.'],
 arm:['添加机械臂','设置机械臂的位置和贴图，也可以让它固定在单位身上或跟随移动。','Arms','Set arm positions and images, and choose whether they stay fixed or move.'],
 attachment:['让单位挂载其他单位','设置挂载位置，以及被挂载单位如何显示、移动和攻击。','Unit attachments','Set attachment positions and how attached units are displayed, moved and used in combat.'],
 decal:['添加额外图层','把标记、光效或其他图像叠加到单位上，并控制显示条件和绘制顺序。','Extra image layers','Add markers, glows or other overlays and choose when and where they appear.'],
 resource:['记录单位自己的资源','创建属于单个单位的资源，例如弹药、热量或技能点，再在动作和条件中使用。','A resource for each unit','Create ammo, heat, ability points or another resource held by each unit. Use it in actions and conditions.'],
 global_resource:['记录整个队伍的资源','创建由同一队伍共享的资源，例如科技点，并选择是否显示在界面上。','A shared team resource','Create a resource shared by a team, such as research points, and choose whether to display it.'],
 placementRule:['限制建筑放在哪里','按附近的单位、标签、距离或数量，决定建筑能否放置。','Building placement rules','Allow or block placement based on nearby units, tags, distance or count.'],
 movement_random:['让单位随机游走','设置随机移动的速度和范围，适合让单位在附近活动。','Random movement','Let the unit wander nearby and adjust how quickly it moves.'],
 movement_repelFromUnits:['避免单位挤在一起','让单位远离附近的其他单位，可选择只对同队单位生效。','Keep units apart','Move away from nearby units, optionally only those on the same team.'],
 mod:['模组的名称和介绍','填写模组在游戏列表中显示的名称、介绍和最低游戏版本。','Mod name and description','Set the name, description and minimum game version shown in the mod list.'],
 music:['添加模组音乐','指定音乐文件夹，并设置这些音乐在什么情况下播放。','Mod music','Choose a music folder and when its tracks should play.']
};
const labels={name:'单位代号',displayText:'显示名称',displayDescription:'单位介绍',class:'单位类型',strictLevel:'代码检查级别',price:'造价',maxHp:'生命值上限',mass:'碰撞质量',radius:'碰撞半径',buildSpeed:'建造时间或速度',techLevel:'科技等级',showInEditor:'在沙盒列表中显示',defineUnitMemory:'单位变量',image:'主贴图',image_wreak:'残骸贴图',image_shadow:'阴影贴图',total_frames:'贴图帧数',imageScale:'贴图大小',canAttack:'允许攻击',canAttackFlyingUnits:'可以攻击空中单位',canAttackLandUnits:'可以攻击地面和水面单位',canAttackUnderwaterUnits:'可以攻击水下单位',maxAttackRange:'攻击距离',shootDelay:'射击间隔',movementType:'移动方式',moveSpeed:'移动速度',moveAccelerationSpeed:'加速速度',moveDecelerationSpeed:'减速速度',maxTurnSpeed:'转向速度',turnAcceleration:'转向加速度',x:'横向位置',y:'纵向位置',projectile:'使用的射弹',altProjectile:'备用射弹',altProjectileCondition:'何时使用备用射弹',directDamage:'直接伤害',areaDamage:'范围伤害',areaRadius:'伤害范围',life:'持续时间',speed:'飞行速度',text:'按钮文字',description:'说明文字',autoTrigger:'自动触发条件',autoTriggerOnEvent:'何时触发',requireConditional:'执行条件',isVisible:'何时显示',isActive:'何时可用',isLocked:'何时锁定',setUnitMemory:'设置变量',setUnitStats:'修改单位属性',alsoTriggerAction:'同时执行的动作',alsoQueueAction:'加入队列的动作',alsoTriggerOrQueueActionConditional:'执行关联动作的条件',spawnUnits:'生成单位',produceUnits:'生产单位',addResources:'增加资源',setResourcesWithLogic:'设置资源',playAnimation:'播放动画',playSoundAtUnit:'播放音效',onShoot_triggerActions:'开火时执行的动作',title:'模组名称',minVersion:'最低游戏版本'};
window.RWEditorCopy={moduleHelp,labels};RWI18n.add(window.RW_UI_EN);RWI18n.add(window.RW_EDITOR_EN);RWI18n.add(window.RW_LABEL_SOURCE);
})();
