describe("Layout:", function() {

  describe("checkConsistency", function() {

    var check = tabris.Layout.checkConsistency;

    it("raises a warning for inconsistent layoutData (width)", function() {
      spyOn(console, "warn");

      check({top: 0, left: 0, right: 0, width: 100});

      var warning = "Inconsistent layoutData: left and right are set, ignore width";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (width)", function() {
      var result = check({top: 0, left: 0, right: 0, width: 100});

      expect(result).toEqual({top: 0, left: 0, right: 0});
    });

    it("raises a warning for inconsistent layoutData (height)", function() {
      spyOn(console, "warn");

      check({top: 0, left: 0, bottom: 0, height: 100});

      var warning = "Inconsistent layoutData: top and bottom are set, ignore height";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (height)", function() {
      var result = check({top: 0, left: 0, bottom: 0, height: 100});

      expect(result).toEqual({top: 0, left: 0, bottom: 0});
    });

    it("raises a warning for inconsistent layoutData (centerX)", function() {
      spyOn(console, "warn");

      check({top: 0, left: 0, centerX: 0});

      var warning = "Inconsistent layoutData: centerX overrides left and right";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (centerX)", function() {
      var result = check({top: 1, left: 2, right: 3, centerX: 4});

      expect(result).toEqual({top: 1, centerX: 4});
    });

    it("raises a warning for inconsistent layoutData (centerY)", function() {
      spyOn(console, "warn");

      check({left: 0, top: 0, centerY: 0});

      var warning = "Inconsistent layoutData: centerY overrides top and bottom";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (centerY)", function() {
      var result = check({left: 1, top: 2, bottom: 3, centerY: 4});

      expect(result).toEqual({left: 1, centerY: 4});
    });

    it("raises a warning for inconsistent layoutData (baseline)", function() {
      spyOn(console, "warn");

      check({left: 0, top: 0, baseline: "#other"});

      var warning = "Inconsistent layoutData: baseline overrides top, bottom, and centerY";
      expect(console.warn).toHaveBeenCalledWith(warning);
    });

    it("skips overridden properties from layoutData (baseline)", function() {
      var result = check({left: 1, top: 2, bottom: 3, centerY: 4, baseline: "other"});

      expect(result).toEqual({left: 1, baseline: "other"});
    });

  });

  describe("encodeLayoutData", function() {

    var encode = tabris.Layout.encodeLayoutData;

    it("creates a safe copy", function() {
      var input = {top: 0, left: 0};
      var output = encode(input);

      expect(output).toEqual(input);
      expect(output).not.toBe(input);
    });

    it("skips null entries", function() {
      var input = {top: 0, bottom: null, width: 0, height: null, centerX: 0, centerY: null};
      var output = encode(input);

      expect(output).toEqual({top: 0, width: 0, centerX: 0});
    });

    it("skips undefined entries", function() {
      var input = {
        top: 0,
        bottom: undefined,
        width: 0,
        height: undefined,
        centerX: 0,
        centerY: undefined
      };
      var output = encode(input);

      expect(output).toEqual({top: 0, width: 0, centerX: 0});
    });

    it("creates a safe copy of arrays", function() {
      var input = {left: [30, 10], top: [70, 20]};
      var output = encode(input);

      expect(output.left).toEqual(input.left);
      expect(output.left).not.toBe(input.left);
    });

    ["width", "height", "centerX", "centerY"].forEach(function(attr) {

      it("fails if '" + attr + "' is not a number", function() {
        expect(function() {
          var layoutData = {};
          layoutData[attr] = "23";
          encode(layoutData);
        }).toThrowError("Invalid value for '" + attr + "': must be a number");
      });

    });

    ["left", "right", "top", "bottom"].forEach(function(attr) {

      it("fails if '" + attr + "' is an object", function() {
        expect(function() {
          var layoutData = {};
          layoutData[attr] = {};
          encode(layoutData);
        }).toThrowError("Invalid value for '" + attr + "': invalid type");
      });

      it("fails if '" + attr + "' is an invalid array", function() {
        expect(function() {
          var layoutData = {};
          layoutData[attr] = [23];
          encode(layoutData);
        }).toThrowError("Invalid value for '" + attr + "': list length must be 2");
      });

    });

    it("fails if 'baseline' is a number", function() {
      expect(function() {
        encode({left: 0, baseline: 23});
      }).toThrowError("Invalid value for 'baseline': must be a widget reference");
    });

    it("fails if 'baseline' is a percentage", function() {
      expect(function() {
        encode({left: 0, baseline: "23%"});
      }).toThrowError("Invalid value for 'baseline': must be a widget reference");
    });

    it("fails for unknown attribute", function() {
      expect(function() {
        encode({left: 0, foo: "23"});
      }).toThrowError("Invalid key 'foo' in layoutData");
    });

    it("translates percentage strings to arrays", function() {
      expect(encode({left: "30%", top: "0%"})).toEqual({left: [30, 0], top: 0});
    });

    it("translates percentages in arrays to numbers", function() {
      var input = {left: ["30%", 0]};
      var output = encode(input);

      expect(output.left).toEqual([30, 0]);
    });

    it("translates selector to array", function() {
      var input = {left: "#other", top: "#other"};
      var expected = {left: ["#other", 0], top: ["#other", 0]};

      expect(encode(input)).toEqual(expected);
    });

    it("translates zero percentage to offset", function() {
      expect(encode({left: "0%", top: ["0%", 23]}))
        .toEqual({left: 0, top: 23});
    });

    it("translates `percentage offset` strings to arrays", function() {
      var input = {left: "30%   5", top: "1% -7", bottom: "-5% +9", right: "100% -10.4"};
      var expected = {left: [30, 5], top: [1, -7], bottom: [-5, 9], right: [100, -10.4]};

      expect(encode(input)).toEqual(expected);
    });

    it("translates `selector offset` strings to arrays", function() {
      var input = {left: "#foo   5", top: "#bar -7", bottom: "#boo +9", right: "#far -10.4"};
      var expected = {left: ["#foo", 5], top: ["#bar", -7], bottom: ["#boo", 9], right: ["#far", -10.4]};

      expect(encode(input)).toEqual(expected);
    });

    it("does not encode widget refs", function() {
      var input = {left: ["#other", 0]};
      var output = encode(input);

      expect(output.left).toEqual(["#other", 0]);
    });

  });

  describe("decodeLayoutData", function() {

    var decode = tabris.Layout.decodeLayoutData;

    it("creates a safe copy", function() {
      var input = {top: 0, left: 0};
      var output = decode(input);

      expect(output).toEqual(input);
      expect(output).not.toBe(input);
    });

    it("creates a safe copy of arrays", function() {
      var input = {left: ["30%", 10]};
      var output = decode(input);

      expect(output.left).toEqual(input.left);
      expect(output.left).not.toBe(input.left);
    });

    it("translates to percentage strings", function() {
      expect(decode({left: [30, 10]})).toEqual({left: ["30%", 10]});
    });

    it("translates arrays with zero percentage to offset", function() {
      expect(decode({left: [0, 23]})).toEqual({left: 23});
    });

    it("translates arrays with zero offset to scalars", function() {
      expect(decode({left: [23, 0], top: ["#other", 0]})).toEqual({left: "23%", top: "#other"});
    });

  });

  describe("resolveReferences", function() {

    var resolve = tabris.Layout.resolveReferences;
    var parent, widget, other;

    beforeEach(function() {
      tabris._reset();
      tabris._init(new NativeBridgeSpy());
      tabris.registerWidget("TestType", {});
      parent = tabris.create("Composite");
      widget = tabris.create("TestType").appendTo(parent);
      other = tabris.create("TestType", {id: "other"}).appendTo(parent);
    });

    afterEach(function() {
      delete tabris.TestType;
    });

    it("translates widget to ids", function() {
      var input = {centerY: other, left: [other, 42]};
      var expected = {centerY: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).toEqual(expected);
    });

    it("translates selectors to ids", function() {
      var input = {baseline: "#other", left: ["#other", 42]};
      var expected = {baseline: other.cid, left: [other.cid, 42]};

      expect(resolve(input, widget)).toEqual(expected);
    });

    it("translates 'prev()' selector to id", function() {
      var input = {baseline: "prev()", left: ["prev()", 42]};
      var expected = {baseline: widget.cid, left: [widget.cid, 42]};

      expect(resolve(input, other)).toEqual(expected);
    });

    it("translates 'prev()' selector to 0 on first widget", function() {
      var input = {baseline: "prev()", left: ["prev()", 42]};
      var expected = {baseline: 0, left: [0, 42]};

      expect(resolve(input, widget)).toEqual(expected);
    });

    it("does not modify numbers", function() {
      var input = {centerX: 23, left: [30, 42]};
      var expected = {centerX: 23, left: [30, 42]};

      expect(resolve(input, widget)).toEqual(expected);
    });

    it("treats ambiguous string as selector", function() {
      tabris.registerWidget("Foo%", {});
      var freak1 = tabris.create("Foo%").appendTo(parent);
      var freak2 = tabris.create("TestType", {id: "23%"}).appendTo(parent);

      expect(resolve({left: ["Foo%", 23], top: ["#23%", 42]}, widget))
        .toEqual({left: [freak1.cid, 23], top: [freak2.cid, 42]});
    });

    it("replaces unresolved selector (due to missing sibling) with 0", function() {
      other.dispose();

      expect(resolve({baseline: "#noone", left: ["#noone", 42]}, widget))
        .toEqual({baseline: 0, left: [0, 42]});
    });

    it("replaces unresolved selector (due to missing parent) with 0", function() {
      widget = tabris.create("TestType");

      expect(resolve({baseline: "#noone", left: ["#noone", 42]}, widget))
        .toEqual({baseline: 0, left: [0, 42]});
    });

  });

  describe("layoutQueue", function() {

    it("calls '_flushLayout' on registered widgets once", function() {
      var widget = {
        _flushLayout: jasmine.createSpy()
      };
      tabris.Layout.addToQueue(widget);

      tabris.Layout.flushQueue(widget);
      tabris.Layout.flushQueue(widget);

      expect(widget._flushLayout).toHaveBeenCalled();
      expect(widget._flushLayout.calls.count()).toBe(1);
    });

  });

});
