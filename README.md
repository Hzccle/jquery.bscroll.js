bScroll
===============

Simple jQuery plugin for scrollbar management.

![alt text](http://i.creativecommons.org/l/by-sa/4.0/88x31.png "Licence Creative Commons")

Requirements
---------------

  - **jQuery 1.7.1+**
  - **jQuery mousewheel plugin** from Brandon Aaron for mouse wheel interactions

Features
--------------
  - Mouse wheel interaction, thanks to Brandon Aaron's jQuery plugin
  - Keyboard interaction
  - Touch screen interaction, for mobiles devices
  - Scrolls drag
  - Autoupdate for DOM modifications

Usage
--------------
This plugin was designed to be user-friendly, but there are somethings you need to know in order to use this plugin:

  - This plugin has **NOT** been tested for all browsers nor jQuery versions.
  - The scrollbars have the classical behavior of scrollbars. It implies that if the element that you need to create a horizontal scrollbar have a right padding, then this right padding will be ignored.
  - This plugin requires some CSS to do the job.

To initialize a simple bScroll:
```javascript
$("#sample").bScroll();
```

To initialize a _full options_ bScroll:
```javascript
$("#sample").bScroll({
    speed: 20,              // Motion value of the scrollbar, in pixels
    propagate: false,       // Propagate events when there is no motion
    events: {
        arrows: true,       // Allow the use of arrows keys to scroll
        mousewheel: true,   // Allow the use of wheel to scroll
        touchscreen: true,  // Allow scroll motion for mobiles devices
        resize: true,       // Allow the plugin to check if the screen is resized
        lifts: true         // Allow the drag of scroll's lift to scroll
    },
    autoupdate: 50          // Amount of time after which the plugin check if the element changed size
 });
 ```
