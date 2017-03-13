require('fabric');
'use strict';
(function (fabric, window, document, undefined) {

  var annoPlus = function (selector) {
    var self = this;


    self.data = {
      ele: null,
      img: null,
      imgUrl: null,
      fcanvas: null,
      fcanvas: null,
      items: null,
      menu: null
    };

    self.default = {
      groupOption: {
        minWidth: 20,
        minHeight: 20,
        strokeColor: 'red',
        strokeWidth: 1,
        cornerColor: 'red',
        cornerSize: 5
      },
      textOptions: {
        size: 10,
        color: '#fff',
        backgroundColor: '#000',
        top: 0,
        left: 0,
        defaultValue: 'others'
      }
    };

    var event = (function () {
      var _isStarted = false;
      var _drawable = true;
      var _selected = false;
      var _mousePos = {
        startX: null,
        startY: null,
        endX: null,
        endY: null
      };
      var _drawingGroup = null;

      return {
        mousedown: function (e) {
          fn.hideMenu();
          if (e.e.button != 0) { // 非左键操作
            return;
          }
          console.log('mouse:down')
          var mouse = self.data.fcanvas.getPointer(e.e);
          _isStarted = false;

          _mousePos = {
            startX: mouse.x,
            startY: mouse.y,
            endX: mouse.x,
            endY: mouse.y
          };

          if (!self.data.fcanvas.getActiveObject()) {
            _drawable = true;
          }

          if (!_drawable) {
            return false;
          }
          _isStarted = true;
          self.data.fcanvas.getObjects().forEach(function (object) {
            object.hasControls = false;
            object.selectable = false;
            object.evented = false;
          });
          var group = new fabric.Group([], {
            height: 0,
            left: _mousePos.startX,
            top: _mousePos.startY,
            hasControls: false,
            selectable: false,
            hasRotatingPoint: false,
            lockScalingFlip: true,
            cornerColor: self.default.groupOption.cornerColor,
            cornerSize: self.default.groupOption.cornerSize,
            cornerStyle: 'circle'
          });
          self.data.fcanvas.add(group);
          self.data.fcanvas.setActiveObject(group)
          self.data.fcanvas.renderAll();
          _drawingGroup = group;
        },
        mousemove: function (e) {
          if (e.e.button != 0) { // 非左键操作
            return;
          }
          var mouse = self.data.fcanvas.getPointer(e.e);

          if (!_drawable) {
            return false;
          }
          if (!_isStarted) {
            return false;
          }

          console.log('mouse:move')

          _mousePos.endX = mouse.x;
          _mousePos.endY = mouse.y;

          self.data.fcanvas.setActiveObject(_drawingGroup)
          _drawingGroup.setCoords();

          // _drawingGroup.setLeft(Math.max(Math.min(_position.startX, _position.endX), 0))

          _drawingGroup.setLeft(Math.min(_mousePos.startX, _mousePos.endX));
          _drawingGroup.setTop(Math.min(_mousePos.startY, _mousePos.endY));
          _drawingGroup.setWidth(Math.abs(_mousePos.endX - _mousePos.startX));
          _drawingGroup.setHeight(Math.abs(_mousePos.startY - _mousePos.endY));

          self.data.fcanvas.renderAll();
          // _data.ffcanvas.discardActiveObject(e)
        },
        mouseup: function (e) {
          if (e.e.button != 0) { // 非左键操作
            return;
          }
          console.log('mouse:up')
          var mouse = self.data.fcanvas.getPointer(e.e);
          var isClick = false;
          // 模拟click事件
          if (Math.floor(mouse.x) == Math.floor(_mousePos.startX) && Math.floor(mouse.y) == Math.floor(_mousePos.startY)) {
            isClick = true;
            console.log('click');
            self.data.fcanvas.remove(_drawingGroup);
            _drawable = true;
            self.data.fcanvas.deactivateAll();

            var activeIndex = -1;
            self.data.items.forEach(function (item, index) {
              var group = item.group;
              group.hasControls = false;
              group.selectable = false;
              group.evented = false;
              if ((mouse.x >= group.left && mouse.x <= group.left + group.width * group.scaleX) &&
                (mouse.y >= group.top && mouse.y <= group.top + group.height * group.scaleY)) {
                activeIndex = index;
              }
            });

            // 某个矩形被选中，则不能进行绘画
            if (activeIndex != -1) {
              var group = self.data.items[activeIndex].group;
              group.hasControls = true;
              group.selectable = true;
              group.evented = true;
              self.data.fcanvas.setActiveObject(group);
              window.group = group;
              _drawable = false;
            }
          }

          if (!isClick && _drawable) {
            _drawingGroup.setLeft(Math.max(Math.min(_mousePos.startX, _mousePos.endX), 0));
            if (_drawingGroup.left < _mousePos.startX) {
              _drawingGroup.setWidth(_mousePos.startX - _drawingGroup.left);
            } else {
              _drawingGroup.setWidth(Math.min(_drawingGroup.canvas.width - _drawingGroup.left, _mousePos.endX - _drawingGroup.left));
            }
            _drawingGroup.setTop(Math.max(Math.min(_mousePos.startY, _mousePos.endY), 0));
            if (_drawingGroup.top < _mousePos.startY) {
              _drawingGroup.setHeight(_mousePos.startY - _drawingGroup.top);
            } else {
              _drawingGroup.setHeight(Math.min(_drawingGroup.canvas.height - _drawingGroup.top, _mousePos.endY - _drawingGroup.top));
            }


            // 绘制矩形的长宽小于groupOption[minWidth|minHeihgt]则忽略不计
            if (_drawingGroup.width <= self.default.groupOption.minWidth || _drawingGroup.height < self.default.groupOption.minHeight) {
              self.data.fcanvas.remove(_drawingGroup);
            } else {

              // 限制矩形的绘制始终在fcanvas内部
              _drawingGroup.on('modified', event.modified.bind(_drawingGroup));

              _drawingGroup.setCoords();
              var boundindRect = _drawingGroup.getBoundingRect();
              _drawingGroup.preBoundingRect = boundindRect;
              if (_drawingGroup.getObjects().length == 0) {
                var text = new fabric.Text(self.default.textOptions.defaultValue, {
                  fontSize: self.default.textOptions.size,
                  fill: self.default.textOptions.color,
                  top: -boundindRect.height / 2,
                  left: -boundindRect.width / 2,
                  originX: 'left',
                  originY: 'top',
                  backgroundColor: self.default.textOptions.backgroundColor
                })
                _drawingGroup.add(text);
              }
              self.data.items.push({
                group: _drawingGroup
              });
              self.data.fcanvas.add(_drawingGroup);
              self.data.fcanvas.renderAll();
            }
          }
          _isStarted = false;
        },
        modified: function (e) {
          console.log('modified')
          var obj = this;
          obj.setCoords();
          var boundindRect = obj.getBoundingRect();
          var preBoundingRect = obj.preBoundingRect;

          obj.setWidth(boundindRect.width);
          obj.setHeight(boundindRect.height);
          obj.setScaleX(1);
          obj.setScaleY(1);

          // 更新坐标
          obj.setCoords();
          boundindRect = obj.getBoundingRect();
          console.log(preBoundingRect)
          console.log(boundindRect);
          if (boundindRect.width <= self.default.groupOption.minWidth || boundindRect.height <= self.default.groupOption.minHeight) {
            obj.setLeft(preBoundingRect.left);
            obj.setWidth(preBoundingRect.width);
            obj.setTop(preBoundingRect.top);
            obj.setHeight(preBoundingRect.height);
          } else {
            if (boundindRect.left + boundindRect.width >= obj.canvas.width) { // 判断右边界
              if (Math.floor(boundindRect.width) != Math.floor(preBoundingRect.width)) { // 若是缩放
                obj.setWidth(obj.canvas.width - boundindRect.left);
              } else { // 若是移动
                obj.setLeft(obj.canvas.width - boundindRect.width);
              }
            }
            if (Math.floor(boundindRect.left) != Math.floor(preBoundingRect.left)) { // 若不是固定在左边界
              if (boundindRect.left <= 0) {
                if (Math.floor(boundindRect.width) != Math.floor(preBoundingRect.width)) { // 若是缩放
                  obj.setLeft(0);
                  var right = preBoundingRect.left + preBoundingRect.width;
                  obj.setWidth(right);
                } else { // 若是移动
                  obj.setLeft(0);
                }
              }
            }
            if (boundindRect.top + boundindRect.height >= obj.canvas.height) {
              if (Math.floor(boundindRect.height) != Math.floor(preBoundingRect.height)) {
                obj.setHeight(obj.canvas.height - boundindRect.top);
              } else {
                obj.setTop(obj.canvas.height - boundindRect.height);
              }
            }
            if (boundindRect.top != preBoundingRect.top) {
              if (boundindRect.top <= 0) {
                if (Math.floor(boundindRect.height) != Math.floor(preBoundingRect.height)) {
                  obj.setTop(0);
                  var bottom = preBoundingRect.top + preBoundingRect.height;
                  obj.setHeight(bottom);
                } else {
                  obj.setTop(0);
                }
              }
            }
          }
          obj.setCoords();
          var boundindRect2 = obj.getBoundingRect();
          obj.preBoundingRect = boundindRect2;
          var text = obj.getObjects('text')[0];
          text.setLeft(-boundindRect2.width / 2);
          text.setTop(-boundindRect2.height / 2);
          obj.canvas.renderAll();

        }
      };
    }).call(this);

    var fn = (function () {
      return {
        loadSelector: function (selector) {
          var ele = document.getElementById(selector);
          if (!ele) {
            throw new Error('元素不存在');
          }
          ele.style.position = 'relative';

          self.data.ele = ele;
          fn.initData();
          fn.initCanvas();
        },
        getEleSize: function () {
          return {
            width: self.data.ele.clientWidth,
            height: self.data.ele.clientHeight
          };
        },
        getImgSize: function () {
          var imgSize = {
            width: self.data.img.width,
            height: self.data.img.height
          };
          return imgSize;
        },
        getCanvasSize: function () {
          var canvasSize = {
            width: self.data.fcanvas.width,
            height: self.data.fcanvas.height
          }
          return canvasSize;
        },
        getJsonData: function () {
          var items = self.data.items;
          var jsonData = [];
          items.forEach(function (item) {
            var text = item.group.getObjects('text')[0];
            var boundingRect = item.group.getBoundingRect();
            var wRatio = fn.getImgSize().width / fn.getCanvasSize().width;
            var hRatio = fn.getImgSize().height / fn.getCanvasSize().height;
            jsonData.push({
              name: 'box',
              class: text.getText(),
              bndbox: {
                xmin: parseInt(boundingRect.left * wRatio),
                xmax: parseInt((boundingRect.left + boundingRect.width) * wRatio),
                ymin: parseInt(boundingRect.top * hRatio),
                ymax: parseInt((boundingRect.top + boundingRect.height) * hRatio)
              }
            })
          })

          return jsonData;
        },
        setJsonData: function (jsonData) {
          var newItems = [];
          jsonData.forEach(function (item) {
            var wRatio = fn.getCanvasSize().width / fn.getImgSize().width;
            var hRatio = fn.getCanvasSize().height / fn.getImgSize().height;
            var left = item.bndbox.xmin * wRatio;
            var top = item.bndbox.ymin * hRatio;
            var width = parseInt((item.bndbox.xmax - item.bndbox.xmin) * wRatio);
            var height = parseInt((item.bndbox.ymax - item.bndbox.ymin) * hRatio);


            // var boundindRect = group.getBoundingRect();

            var group = new fabric.Group([], {
              left: left,
              top: top,
              width: width,
              height: height,
              hasControls: false,
              selectable: false,
              hasRotatingPoint: false,
              lockScalingFlip: true,
              cornerColor: self.default.groupOption.cornerColor,
              cornerSize: self.default.groupOption.cornerSize,
              cornerStyle: 'circle'
            });


            var text = new fabric.Text(item.class, {
              fill: self.default.textOptions.color,
                fontSize: self.default.textOptions.size,
                top: -height / 2,
                left: -width / 2,
                originX: 'left',
                originY: 'top',
                backgroundColor: self.default.textOptions.backgroundColor
            });
            group.add(text);
            self.data.fcanvas.add(group);
            group.on('modified', event.modified.bind(group));
            group.setCoords();
            var boundindRect = group.getBoundingRect();
            group.preBoundingRect = boundindRect;

            newItems.push({
              group: group
            });
          })
          self.data.items = newItems;
          self.data.fcanvas.renderAll();
        },
        initCanvas: function () {
          var canvas = document.createElement('canvas');
          self.data.ele.appendChild(canvas);
          self.data.menu = document.createElement('div');
          self.data.menu.addEventListener('click', function (e) {
            e.preventDefault();
            // e.stopPropagation();
            var obj = self.data.fcanvas.getActiveObject();
            console.log(obj)
            self.data.fcanvas.remove(obj);
            self.data.fcanvas.remove(obj);
            fn.hideMenu();
            self.data.fcanvas.renderAll();
            var newItems = [];
            var groups = self.data.fcanvas.getObjects();
            groups.forEach(function (group) {
              newItems.push({
                group: group
              });
            });
            self.data.items = newItems;
          }, false);

          var textNode = document.createTextNode('删除');
          self.data.menu.appendChild(textNode);
          self.data.menu.setAttribute('class', 'anno-menu');
          self.data.ele.appendChild(self.data.menu);


          var fcanvas = new fabric.Canvas(canvas, {
            perPixelTargetFind: false,
            selection: false,
            backgroundColor: ''
          });

          // 设置fcanvas事件
          fcanvas.on('mouse:down', event.mousedown.bind(fcanvas));
          fcanvas.on('mouse:move', event.mousemove.bind(fcanvas));
          fcanvas.on('mouse:up', event.mouseup.bind(fcanvas));

          fcanvas.on('after:render', function (e) {
            fcanvas.contextContainer.strokeStyle = self.default.groupOption.strokeColor;
            fcanvas.forEachObject(function (obj) {
              if (obj instanceof fabric.Group) {
                var bound = obj.getBoundingRect();
                fcanvas.contextContainer.strokeRect(
                  bound.left,
                  bound.top,
                  bound.width,
                  bound.height
                );
                var setCoords = obj.setCoords.bind(obj);
                obj.on({
                  moving: setCoords,
                  scaling: setCoords,
                  rotating: setCoords
                });
              }
            });
          });
          document.getElementsByClassName('upper-canvas')[0].addEventListener('contextmenu', function (e) {
            console.log('right')
            var objectFound = false;
            var clickPoint = new fabric.Point(e.offsetX, e.offsetY);

            e.preventDefault();
            console.log(clickPoint)
            fcanvas.forEachObject(function (obj) {
              if (!objectFound && obj.containsPoint(clickPoint)) {
                objectFound = true;
                obj.hasControls = true;
                obj.selectable = true;
                obj.evented = true;
                obj.canvas.setActiveObject(obj);
                //TODO: whatever you want with the object
                self.data.menu.style.left = clickPoint.x + (fn.getEleSize().width - fn.getCanvasSize().width) / 2 + 'px';
                self.data.menu.style.top = clickPoint.y + (fn.getEleSize().height - fn.getCanvasSize().height) / 2 + 'px';
                fn.showMenu();
                return;
              }
            });
            if (!objectFound) {
              fn.hideMenu();
            }
          }, false);
          self.data.fcanvas = fcanvas;
        },
        initData: function () {
          self.data.img = null;
          self.data.imgUrl = null;
          self.data.items = [];
        },
        drawImg: function () {
          var eleRatio = fn.getEleSize().width / fn.getEleSize().height;
          var imgRatio = fn.getImgSize().width / fn.getImgSize().height;
          var canvasSize = {};
          if (imgRatio < eleRatio) {
            canvasSize.height = fn.getEleSize().height;
            canvasSize.width = (canvasSize.height / fn.getImgSize().height) * fn.getImgSize().width;
          } else {
            canvasSize.width = fn.getEleSize().width;
            canvasSize.height = (canvasSize.width / fn.getImgSize().width) * fn.getImgSize().height;
          }
          // _data.fcanvas.setDimensions({
          //   width: canvasSize.width,
          //   height: canvasSize.height
          // });
          self.data.fcanvas.setWidth(canvasSize.width);
          self.data.fcanvas.setHeight(canvasSize.height);
          // 初始化fcanvas背景图片的实例
          // var imgInstance = new fabric.Image(self.data.img, {
          //   hasControls: false,
          //   lockMovementY: true,
          //   lockMovementX: true,
          //   evented: false,
          //   width: canvasSize.width,
          //   height: canvasSize.height
          // });
          // // _data.fcanvas.add(imgInstance)
          // self.data.fcanvas.setWidth(canvasSize.width);
          // self.data.fcanvas.setHeight(canvasSize.height);
          self.data.fcanvas.setBackgroundImage(self.data.imgUrl, self.data.fcanvas.renderAll.bind(self.data.fcanvas), {
            backgroundImageOpacity: 1,
            width: canvasSize.width,
            height: canvasSize.height,
            hasControls: false,
            evented: false
          });
        },
        hideMenu: function () {
          self.data.menu.style.display = 'none';
        },
        showMenu: function () {
          self.data.menu.style.display = 'block';
        },
        toggleMenu: function () {
          if (self.data.menu.style.display == 'none') {
            self.data.menu.style.display = 'block'
          } else {
            self.data.menu.style.display = 'none'
          }
        },
        load: function (imgUrl, annoArr, callback) {
          self.data.fcanvas.clear();
          var image = new Image();
          image.onload = function () {
            self.data.img = image;
            self.data.imgUrl = imgUrl;
            fn.drawImg();
            if (annoArr) {
              fn.setJsonData(annoArr);
            } else {
              fn.setJsonData([]);
            }
            callback();
          }
          image.src = imgUrl;
        },
        setNowText: function (value) {
          var activeGroup = self.data.fcanvas.getActiveObject();
          if (!activeGroup) {
            return false;
          }
          var text = activeGroup.getObjects('text')[0];
          text.setText(value);
          self.default.textOptions.defaultValue = value;
          self.data.fcanvas.renderAll();
        }
      };
    }).call(this);

    this.getJsonData = fn.getJsonData;
    this.load = fn.load;
    this.setNowText = fn.setNowText;

    fn.loadSelector(selector);
  };

  var prop = annoPlus.prototype = {
    constructor: annoPlus,
    version: '1.0.0'
  };

  // 内部方法
  var _fn = {
    /**
     * 加载图片
     * @param {String|Instance} img 图片的链接|HTMLImageElement实例
     * @method
     */
    // loadImg: function (img) {
    //   return new Promise(function (resolve, reject) {
    //     if (img instanceof HTMLImageElement) {
    //       _data.img = img;
    //       _data.imgSize = {
    //         width: img.width,
    //         height: img.height
    //       };
    //       resolve();
    //     } else if (typeof img === "string") {
    //       var image = new Image();
    //       image.onload = function () {
    //         var thisImage = this;
    //         _data.img = thisImage;
    //         _data.imgUrl = img;
    //         _data.imgSize = {
    //           width: thisImage.width,
    //           height: thisImage.height
    //         };

    //         resolve();
    //       };
    //       image.src = img;
    //     } else {
    //       reject('无法加载图片: ' + img.toString());
    //     }
    //   });

    // },


  }

  window.annoPlus = annoPlus;

})(fabric, window, document);
