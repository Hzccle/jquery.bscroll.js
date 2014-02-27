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
  - Touch screen interaction, for touch screens
  - Moving of the scrollbars via drag'n drop
  - Auto update when DOM modifications occure

Usage
--------------
This plugin was designed to be user-friendly, but there are some things you need to know in order to use it:

  - This plugin has **NOT** been tested for all browsers nor jQuery versions.
  - The scrollbars have the classic behavior of the originals. It implies that if the element for which you need to create a horizontal scrollbar has a right padding, then this right padding will be ignored.
  - This plugin requires some CSS to do the job.

To initialize a simple bScroll:
```javascript
$("#sample").bScroll();
```

To initialize a _full options_ bScroll:
```javascript
$("#sample").bScroll({
    speed: 20,              // Pixel moving value of the scrollbars
    propagate: false,       // Spread the events when there is no motion
    events: {
        arrows: true,       // Allow the use of arrows keys to scroll
        mousewheel: true,   // Allow the use of the mouse wheel to scroll
        touchscreen: true,  // Allow scroll motion for touch screens
        resize: true,       // Allow the plugin to check if the screen is resized and adjusts itslef
        lifts: true         // Allow the drag of scroll's bar to scroll
    },
    autoupdate: 50          // Cycle duration at the end of which the plugin checks if the element has resized and then adjusts itself, in milliseconds
 });
 ```
