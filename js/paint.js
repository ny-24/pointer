'use strict';

class Paint {
  constructor(canvasId) {
    this.m_ = new PaintModel(canvasId);
    this.v_ = new PaintView(this.m_);
    this.manageEvents_();
  }

  manageEvents_() {
    this.m_.canvas.addEventListener('mousedown', (e) => { this.m_.mouseDown(e); });
    this.m_.canvas.addEventListener('mouseup', (e) => { this.m_.mouseUp(); });
    this.m_.canvas.addEventListener('mousemove', (e) => { this.m_.mouseMove(e); });
  }
}

class PaintModel {
  constructor(canvasId) {
    this.canvas_ = document.getElementById(canvasId);
    this.canvasWidth_ = this.canvas_.width;
    this.canvasHeight_ = this.canvas_.height;
    this.ctx_ = this.canvas_.getContext('2d');
    this.cacheImages_ = [];
    this.isDraw_ = false;
    this.point_ = {x: null, y: null};
    this.oldPoint_ = {x: null, y: null};
    this.midPoint_ = {x: null, y: null};
    this.oldMidPoint_ = {x: null, y: null};
    this.color = 'rgb(255, 0, 0)';
    this.lineWidth = 2;
    this.selectedTool_ = PaintModel.CONST.TOOL.PEN;
  }

  static get CONST() {
    return {
      EVENT_UPDATE_POINT: 'event-update-point',
      TOOL: {
        PEN: 'tool-pen'
      },
      CACHE_IMAGE_MAX: 10,
    };
  }

  get canvas() { return this.canvas_; }
  get ctx() { return this.ctx_; }
  get isDraw() { return this.isDraw_; }
  get point() { return this.point_; }
  get oldPoint() { return this.oldPoint_; }
  get midPoint() { return this.midPoint_; }
  get oldMidPoint() { return this.oldMidPoint_; }
  get selectedTool() { return this.selectedTool_; }

  set color(value) {
    this.color_ = value;
    this.ctx_.strokeStyle = value;
  }

  set lineWidth(value) {
    this.lineWidth_ = value;
    this.ctx_.lineWidth = value;
  }

  setPoint_(x, y) {
    if (this.point_.x === null) {
      this.point_.x = x;
      this.point_.y = y;
      this.midPoint_.x = x;
      this.midPoint_.y = y;
    }
    this.oldPoint_.x = this.point_.x;
    this.oldPoint_.y = this.point_.y;
    this.oldMidPoint_.x = this.midPoint_.x;
    this.oldMidPoint_.y = this.midPoint_.y;
    this.midPoint_.x = (this.oldPoint_.x + x) / 2;
    this.midPoint_.y = (this.oldPoint_.y + y) / 2;
    this.point_.x = x;
    this.point_.y = y;
  }

  mouseDown(e) {
    this.setCacheImage_();
    let rect = e.target.getBoundingClientRect();
    this.setPoint_(e.clientX - rect.left, e.clientY - rect.top);
    this.isDraw_ = true;
    this.dispatchEvent_(this.canvas_, PaintModel.CONST.EVENT_UPDATE_POINT);
  }

  mouseMove(e) {
    if (!this.isDraw_) return;
    let rect = e.target.getBoundingClientRect();
    this.setPoint_(e.clientX - rect.left, e.clientY - rect.top);
    this.dispatchEvent_(this.canvas_, PaintModel.CONST.EVENT_UPDATE_POINT);
  }

  mouseUp() {
    this.setPoint_(null, null);
    this.isDraw_ = false;
  }

  setCacheImage_() {
    if (this.cacheImages_.length >= PaintModel.CONST.CACHE_IMAGE_MAX) {
      this.cacheImages_.shift();
    }
    this.cacheImages_.push(this.ctx_.getImageData(0, 0, this.canvasWidth_, this.canvasHeight_));
  }

  dispatchEvent_(target, eventName) {
    target.dispatchEvent(new Event(eventName));
  }
}

class PaintView {
  constructor(m) {
    this.m_ = m;
    this.manageEvents_();
  }

  manageEvents_() {
    this.m_.canvas.addEventListener(PaintModel.CONST.EVENT_UPDATE_POINT,() => { this.drawAction_(); });
  }

  drawAction_() {
    document.body.style.cursor = 'default';
    switch (this.m_.selectedTool) {
      case PaintModel.CONST.TOOL.PEN:
        this.drawLine();
        break;
    }
  }

  drawLine() {
    let ctx = this.m_.ctx;
    let m = this.m_;
    ctx.beginPath();
    ctx.moveTo(m.oldMidPoint.x, m.oldMidPoint.y);
    ctx.quadraticCurveTo(m.oldPoint.x, m.oldPoint.y, m.midPoint.x, m.midPoint.y);
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}
