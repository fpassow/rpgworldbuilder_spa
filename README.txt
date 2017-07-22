README
------

Architecure
-----------

This is a single page application, rpgworldbuilder.html

Parts:
1. Controller functions...
    a) respond to events
    b) keep NO application state
    b) may use a few utility functions to update the model object from
         html controls on the page
    c) update the model
    d) talk to the server (using clientlib.js)
    e) may NOT write directly to the DOM (window.alert and window.prompt are OK)
    f) call a method on views to update the UI. 

2. Model
    One object containing all the application state:
        a) Campaign and User objects read from and written to the server
        b) Information about user login and what they are currently doing

    The model is updated from the UI, modified by the controller, and read
    by the view code.
    

3. clientlib.js
    Functions that:
       a) talk to the server.
       b) are only used by the controller.
       c) read and write our domain objects, User and Campaign.

   Basically, each function is just an ajax call. They are not really complex.
   They were exiled here because they were a whole lot of lines for a single
   conceptual task. And made reading the controller code harder than it had to be.


4. Views
    The views object has a "standard view" method, and others which display a few
    special purpose views. The point of a view method is to display a UI based on
    the content of the model
    
    View methods:
        a) take two arguments, model and controller
        b) may NOT write to the model
        c) use the controller reference to wire up
            event handlers on dynamically generated elements.
        d) may NOT call controller methods.
        e) may NOT talk to the server (duh)


Flow Summary:
  1) Event
  2) Controller
      [update model from UI]
      [Talk to server]
      [Update model]
  3) Views method
      Read model
      Write to DOM


Admin Page
----------

admin.html is a second SPA. You log in with an admin account and do admin stuff.

 (TODO: Put the two SPA's in their own directories?...plus a third place for the
 common stuff)


Note for later
--------------
The two utility methods that update the model from the UI are
   quivering on the edge of becoming a separate part of the architecture.


Project history and personal rambling
-------------------------------------

I haven't learned Angular, React, Ember, etc. yet. So details and 
vocabulary of the above might seem clueless or weird. But I really wanted to focus on
a front end JavaScript programming problem before focusing on how to solve one with
a specific tool. 

I started with separate "widgets" for User, CampaignList, and Campaign 
(top-left, lower-lef, and right). The widgets managed their own parts of the UI,
kept their own state, and offered "public" methods and callbacks used by the other
widgets.

But the widgets were getting ugly because of dependencies of what to display 
based on state stored in other widgets. And worse, making sure everything changed
when it had to. And I got to the current MVC(ish) plan from wanting to throw one 
big ball of state on the table and shout, "Here's all the state. Everyone just
draw yourselves from THIS, NOW."

A good observables design might have worked too. And there are still plenty of parts
of M, V, and C which want to be with theother parts of their old widgets more than
they want to be with the rest of the M, V, or C.

But MVC seems better at organizing a world around the almighty click. Viewport-click-viewport.

So maybe MVC is right for a part of a system if viweport-click-viewport is the
hardest problem it's solving. Annnnnyway...



