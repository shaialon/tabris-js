# Native Widgets

## Creating a Native Widget

In tabris.js, native widgets are created using the `tabris.create` method.

### `tabris.create(type, properties*)`

Creates a native widget of a given type and returns its reference.

Parameters:

- *type*: the type of the widget to create (*string*)
- *properties (optional)*: a set of initial widget properties (*object*)

Example:
```javascript
var button = tabris.create("Button", {
  text: "OK",
  layoutData: {right: 10, bottom: 10}
});
```

## Widget Properties

Every native widget has a set properties (e.g. a text or a color). These properties can be read and written using the methods `get` and `set`, respectively.

### `get(name)`

Retrieves the current value of the given property from the widget and returns it.

Parameters:

- *name*: the name of the property (*string*)

Example:
```javascript
var input = textField.get("text");
```

### `set(name, value)`

Set a widget property. Returns the widget itself.

Parameters:

- *name*: the property name (*string*)
- *value*: the new value of the property

Example:
```javascript
label.set("text", "Hello World");
```

### `set(properties)`

Set a number of widget properties at once. Returns the widget itself.

Parameters:

- *properties*: a set of widget properties to set (*object*)

Example:
```javascript
label.set({
  text: "There were errors!",
  foreground: "red"
});
```

# The Widget Hierarchy

To be visible, a widget needs a parent. The top-level parent of every UI is a `Page`. Widgets can be included in the widget hierarchy using `append` or `appendTo`.

### `appendTo(parent)`

Appends the widget to a parent. If the widget already has a parent, it is deregistered from the actual parent and registered with the new one. Returns the widget itself.

Parameters:

- *parent*: the new parent to append the widget to

Example:

```javascript
var button = tabris.create("Button", {
  text: "OK",
  ...
}).appendTo(page);
```

### `append(child, child*, ...)`

Append one or more child widget to this widget. This method is equivalent to calling `appendTo` on every child, e.g. `parent.append(child1, child2)` is a short cut for calling `child1.appendTo(parent)` and `child2.appendTo(parent)`. Returns the widget itself.

Parameters:

- *child*: a child to append to this widget

Example:

```javascript
buttonBar.append(okButton, cancelButton);
```

# Events

Widgets can fire a number of events, e.g. on touch or on modification. Event listeners can be added using the `on` method and removed using `off`. Returns the widget itself.

### `on(type, listener, context*)`

Binds a listener function to the widget. The listener will be invoked whenever an event of the given event type is fired.

Note that event types are case sensitive. All tabris.js event types are lowercase.

Parameters:

- *type*: the event type to listen for, case sensitive
- *listener*: the listener function to register
- *context (optional)*: the value of `this` in the listener function during invocation

Example:

```javascript
var selectionHandler = function() {
  console.log("Button selected!");
};
button.on("selection", selectionHandler);
```

### `off(type*, listener*, context*)`

Remove a previously-bound listener function from a widget. If no context is specified, all of the versions of the listener with different contexts will be removed. If no listener is specified, all listeners for the event will be removed. If no type is specified, callbacks for all events will be removed. Returns the widget itself.

Parameters:

- *type (optional)*: the event type to remove listeners for
- *listener (optional)*: the listener function to remove
- *context (optional)*: the context that the listener has been registered with

Example:

```javascript
button.off("selection", selectionHandler, this);
```

### `trigger(type, param*, ...)`

Programmatically invoke all listeners for the given event type with a given set of parameters. Returns the widget itself.

Parameters:

- *type*: the event type to trigger
- *param (optional)*: A number of parameters to be passed to the listener functions

## Disposing Of a Widget

### `dispose()`

Disposes of the widget, destroys all of its children widgets and triggers a *dispose* event.

Example:

```javascript
button.on("dispose", function() {
  console.log("Button disposed!");
});
button.dispose();
```