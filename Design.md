# Design of the forum

Goal :

When arriving on the main page, unregistered visitors can read a list of topics. They can create new topics, read existing topics, and reply to existing topics.

the topic list is stored in a public mutable, and each topic is stored in a public mutable.

Each topic row acts as a link to the topic, and contains :

 * Title,
 * Author,
 * Date created,
 * last modified date  
 * a "add to ignore list" button next to the author field , that causes all of the replies / topics by corresponding name to be hidden*
 * a "delete" button *if* the visitor is admin ( owns the hostname )
 * a "ban" button *if* the visitor is admin ( owns the hostname )

A "new topic" button allows to create a new topic.
A "settings" button allows to manage the visitor's settings.

By clicking on a topic link, the page is cleared and the visitor is shown :

  * the Topic Title
  * the name of the Author
  * the date of creation of the topic
  * the original post

  followed by the visitors replies ( if any ) in rows  containing:

  * the name of the poster,
  * the date of the reply,
  * the ( formatted ) text of the reply,
  * a "like" button
  * a "add to ignore list" button next to the author field, that causes all of the replies / topics by corresponding name to be hidden*
  * a "delete" button *if* the visitor is admin ( owns the hostname )
  * a "ban" button *if* the visitor is admin ( owns the hostname )

  followed by a "reply" button.

By clicking on the topic's page "reply" button, if needed the app requests authorisation to the authenticator, then once authed a form is displayed that allows the visitor to :

  * pick a nick from a list of their public IDs or pick "anonymous"
  * write some ( formated ? ) text in a field
  * click on one of 2 buttons : "cancel" or "reply"

By clicking on the form "reply" button, the form is cleared, hidden, the reply is saved to SAFE, and the list of replies is updated.

By clicking on the main page "new topic" button, if needed the app requests authorisation to the authenticator, then once authed a form is displayed that allows the visitor to :

  * pick a nick from a list of their public IDs or pick "anonymous"
  * write some ( formated ? ) text in a field
  * click on one of 2 buttons : "cancel" or "publish"

By clicking on the form "publish" button, the form is cleared, hidden, the reply is saved to SAFE, and the list of topics is updated.

By clicking on the main page "settings" button, if needed the app requests authorisation to the authenticator, then once authed the visitor can :

  * create , delete public IDs
  * manage their ignore list
  * manage the ban list *if* the visitor is admin ( owns the hostname )
