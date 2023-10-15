document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector("#compose-form").addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-detail-view').style.display = 'block';

      document.querySelector('#email-detail-view').innerHTML = `
      <h6><strong>From:</strong>${email.sender}</h6>
      <h6><strong>To:</strong>${email.recipients}</h6>
      <h6><strong>Subject:</strong>${email.subject}</h6>
      <h6><strong>Timestamp:</strong>${email.timestamp}</h6>
      <p>${email.body}</P>
      `
      if (email.read == false){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }

      const buttonArchived = document.createElement('button');
      if (email.archived == true){
        buttonArchived.innerHTML = "unarchive";
      } else {
        buttonArchived.innerHTML = "archive";
      }
      
      if (email.archived == true){
        buttonArchived.className = "btn btn-success";
      } else {
        buttonArchived.className = "btn btn-danger";
      }

      buttonArchived.addEventListener('click', function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: !email.archived
          })
        })
        .then(() => { load_mailbox('archive')})
      });
      document.querySelector('#email-detail-view').append(buttonArchived);
  
      const buttonReply = document.createElement('button');
      buttonReply.innerHTML = "reply"
      buttonReply.className = "btn btn-info";
      buttonReply.addEventListener('click', function() {
        compose_email();

        document.querySelector('#compose-recipients').value = email.sender;
        let subject = email.subject
        if(subject.split(' ',1)[0] != "Re:"){
          subject = "Re: " + email.subject;
        }
        document.querySelector('#compose-subject').value = subject;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;      

      })
      document.querySelector('#email-detail-view').append(buttonReply)
    });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(oneEmail =>{
      
      const newEmail = document.createElement('div');
      newEmail.className = "list-group-item";
      
      newEmail.innerHTML = `<h6>Sender: ${oneEmail.sender}</h6>
      <h4>Subjet: ${oneEmail.subject}</h4>
      <h6>${oneEmail.timestamp}</h6>
      `;

      if (oneEmail.read == true){
        newEmail.className = 'read';
      } else {
        newEmail.className =  'unread';
      } 

      newEmail.addEventListener('click', function(){view_email(oneEmail.id)});
      
      document.querySelector('#emails-view').append(newEmail);

    })    
  }); 
  
}
function send_email(event){
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  });

}