var container = $('#scroller'),
    content = $('#blog-content'),
    scroll = $('scrollbar'),
    doc = $(document);
content.on('scroll', function(e) {
  scroll.stop(true).css({
    height: Math.pow(container.height(), 2) / content[0].scrollHeight,
    top: content.height() * content[0].scrollTop / content[0].scrollHeight + 5
  });//.delay(2000).animate({opacity: 0});
});
$(window).on('resize', content.trigger.bind(content, 'scroll'));
content.trigger('scroll');

scroll.on('mousedown', function(e){
  e.preventDefault();
  var y = scroll[0].offsetTop;
  var y1 = e.originalEvent.pageY;
  doc.on('mousemove', function(e){
    var y2 = e.originalEvent.pageY;
    scroll.css('top', Math.min(container.height() - scroll.height()  + 5,Math.max(5, y + y2 - y1)));
    content[0].scrollTop = (content[0].scrollHeight * scroll[0].offsetTop / content.height());
    
  });
  doc.on('mouseup', function(){
    doc.off('mousemove');
  });
});
$('close').click(function(){
 var th = this.parentNode.parentNode;
 $(th).toggleClass('opened');
});
$('#side-int').click(function(){
 $('#integer-status').toggleClass('opened');
});
$('#side-nitro').click(function(){
 $('#nitro-nova-t').toggleClass('opened');
});
$('#side-know').click(function(){
 $('#knowledge').toggleClass('opened');
});
$('#side-needs').click(function(){
 $('#needs').toggleClass('opened');
});
$('#side-celia').click(function(){
 $('#celia-window').toggleClass('opened');
});



/** Celia **/
// Terminal Constructor
function Terminal(is,com,cont,index,t)
{
 this.is      = is;         // We will assign #term to this variable.
 this.com     = com;        // #term-entry will be in here.
 this.inp     = com.toString() + ' > div > input';
 this.cont    = cont;       // Container for the terminal.
 this.history = [];         // Command history of the terminal.
 this.log     = [];         // Output history of the terminal.
 this.index   = index;      // History counter for past commands.
 this.t       = t;          // Temporary command of the terminal.
 
 $(this.com.toString()).hover(function()
 {
  $(this).fadeTo('fast',1);
 },function()
 {
  $(this).fadeTo('fast',0.7);
 });
}

//--- Declare All Terminal Objects -----------------------------------
var term = new Terminal('#term','#term-entry','#term-container',0,' ');

//--- Taking terminal input -------------------------------------------
Terminal.prototype.takeKeyInput = function(key)
{
 var k = parseInt(key.which,10);
 switch(k)
 {
  case 13:
  {//
   if( $(this.inp).val() )
   {
    this.history[ this.history.length ] = $(this.inp).val();
    //Appends command to the last spot. THEN, the last spot+=1.
    this.index=this.history.length; //The new length is then assigned to index.
    $(this.inp).val(''); //The input is cleared. In here, it actually works.
    this.processCommand( this.history[ this.index - 1 ] ); //Then the termminal printing thing does its magic.
   }
   break;
  }// Current spot:
  // Replace termm with $(this) and $(this) with $(this.inp)
  case 38: // Up
  case 40:
  {// Down
   var r = k-39; //-1 if Up, 1 if down.
   if(r<0 && (this.index!==0 && this.index===this.history.length) )
   { //Get it started.
    if( $(this.inp).val() )
    {
     this.t=$(this.inp).val();
    }
    else
    {
     this.t='';
    }
    this.index--;
    $(this.inp).val( this.history[this.index].toString() );
   }
   else if(r>0 && this.index===this.history.length-1)
   { //if Down
    $(this.inp).val( this.t.toString() );
    this.index=this.history.length;
   }
   else if((r>0 && this.index<(this.history.length-1)) || (r<0 && this.index>0))
   { //If we're in the process of cycling through the past commands...
    this.index+=r;
    $(this.inp).val( this.history[this.index].toString() );
   } //Replace the value of the input with the next/prev cycled command, adjust the index.
   break;
  }
  default:
  {
   if($(this.inp).val() && this.index!==this.history.length){this.index=this.history.length;}
  }
 }
};

//--- Redraw the terminal ---------------------------------------------
Terminal.prototype.redraw = function()
{
 var wW = $(window).width(); //retrieve current window width
 var wH = $(window).height(); //retrieve current window height
 $( this.inp).css('width',(wW-70)+'px');
 //$( this.is.toString() ).css('width',(wW-52)+'px');
 $( this.is.toString() ).css('height',(wH-50)+'px');
 //$( this.cont.toString() ).css('width',(wW-36)+'px').css('height',(20)+'px');
 //$( this.com.toString() ).css('width',(wW-36)+'px').css('height',wH*0.05+'px');
 //$( this.com.toString() + ' > div').css('padding-top',(wH*0.003)+'px');
};

// Define pretty much all prototype functions before document.ready
//--- Clearing terminal output ----------------------------------------
Terminal.prototype.clear = function()
{
 this.log.length=0;
 $( this.is.toString() ).empty();
};
//--- Terminal output of items to the screen. -------------------------
Terminal.prototype.print = function(content,width,height,alt)
{
 if(!content)
 {
  this.log[ this.log.length ] = []; // Now you can printG to it.
  $( this.is ).prepend('<div> </div>');
 }
 else if(!width || !height || !alt)
 {
  this.log[ this.log.length ] = content;
  $( this.is.toString() ).prepend('<div>'+content+'</div>');
 }
 else
 {
  this.print('<img src=\"'+content+'\" width=\"'+width+'\" height=\"'+height+'\" alt=\"'+alt+'\" />');
 }
};

Terminal.prototype.printG = function(content,width,height,alt)
{
 if(!width || !height || !alt)
 {
  this.log[ this.log.length - 1 ][ this.log[this.log.length-1].length ] = content;
  $(this.is+' > div').first().append('<div>'+content+'</div>');
 }
 else
 {
  this.printG('<img src=\"'+content+'\" width=\"'+width+'\" height=\"'+height+'\" alt=\"'+alt+'\" />');
 }
}

//--- Now that everything is defined, we can begin initiating terminals.
$(document).ready(function()
{
 term.init();
 $(term.inp).keydown(function(key)
 {
  term.takeKeyInput(key);
 });
 $(term.inp).focus();
 $(window).resize(function()
 {
  term.redraw();
 });
});


// term specific functions:
//--- Terminal Initialization: ----------------------------------------
term.init = function()
{
 term.redraw();
 // Print the cool-looking header.
 term.print(); // Start a group for printG
 term.printG('PROJECT VIGILANTE TSUBO ///////////////////////////////// 自警団坪');
 term.printG('Establishing Connection...................................... 100%');
 term.printG('------------------------------------------------------------------');
 term.printG('<span class="c4">    //// \\  /// /////// /////  /////    ////, // // // /// // // </span>');
 term.printG('<span class="c4">   //     \\/// //___/  _____  //   //  // // // // /// // //,/   </span>');
 term.printG('<span class="c1">  //__    /// //___/,        //////   ///// // // // /// //\\   </span> ');
 term.printG('<span class="c4"> /////   /// ///////  ///// //    // //    ///// /// // //  \\   </span>');
 term.printG('------------------------------------------------------------------');
 term.printG('<span class="c2">¥ >>> Don\'t Trust the Man, Don\'t Trust the Money! Delete system32!</span>');
 term.printG('img/celia.jpg','395px','230px','Celia');
 term.printG('CELIA: Hey. If you are new, type /help for commands.');
};

//--- Terminal Processing section: ------------------------------------
//Temporary function for processing commands.
term.processCommand = function(com)
{
 //Catch and interpret commands first.
 //If it's not a command, try to process it as AI conversation.

 switch( com.toLowerCase() )
 {
  case '/clear':
  {
   term.clear();
   break;
  }
  case '/help':
  {
   term.print();
   term.printG('Current Command List:');
   term.printG('/clear   // Clears the command prompt. Cannot be undone.');
   term.printG('/exit    // Cancels out current action. Cannot be undone.');
   term.printG('/man     // Display a guide to the chosen command.');
   term.printG('/profile // Display the profile of a member of the squad.');
   term.printG('/test    // Developer use only.');
   break;
  }
  case '/test':
  {
   term.clear();// Always clear first, then print in reverse order.
   term.print();
   term.printG('Working...');
   term.printG('It worked...');
   break;
  }
  case '/man profile':
  {
   term.clear();
   term.print();
   term.printG('Usage: /command -option detail');
   term.printG('Example: /profile -m GUNHEAD');
   term.printG('img/chatsubobanner.png',411,75,'Chatsubo Banner');
   term.printG('About: Profile is a simple prompt for returning the profile of a ');
   term.printG('member of the Tsubo group. The Tsubo site exists as a resource and');
   term.printG('a reference for the members of the Tsubo squad, a band of talented');
   term.printG('cyberpunks with varying skill sets and personalities. Knowing them');
   term.printG('as much as they allow is only reserved for the cyberpunk-inclined.');
   term.printG(' '); // This prints a space between the lines, not a new group.
   term.printG('Available options:');
   term.printG('-h or --help  View a shorter version of this manual.');
   term.printG('-l or --list  View the list of members on the squad.');
   term.printG('-m MEMBER     View the profile of a member');
   break;
  }
  case '/profile -l':
  case '/profile --list':
  {
   term.print();
   term.printG('List of members:');
   term.printG('GUNHEAD     // Founder of Tsubo.');
   term.printG('LADY SAVANT // Writer, coder, runner.');
   term.printG('NITRO NOVA  // Artist, hacker, engineer, web dev, swordsman.');
   break;
  }
  case '/profile':
  {
   term.print('<span class=\"c1\">Arguments needed. Please use man profile for help.</span>');
   break;
  }
  case '/profile -h':
  case '/profile --help':
  {
   term.print();
   term.printG('Available options:');
   term.printG('-l or --list    // View list of MEMBERs of the squad.');
   term.printG('-m MEMBER // View profile of individual MEMBER.');
   break;
  }
  case '/profile -m nitro nova':
  {
   term.clear();
   term.print();
   term.printG('img/nitronova.png',411,150,'Nitro Nova');
   term.printG('DARKNET NAME: NITRO NOVA');
   term.printG('PROPERTIES: 23 / ♂ / 5\'10\" / SOCIAL JUSTICE WARRIOR');
   term.printG('LOCATION: PENNSYLVANIA, USA');
   term.printG('LANGUAGES: ASSEMBLY, C, JAVA, JAVASCRIPT, PYTHON, HASKELL, RUBY');
   term.printG('SKILLS: Hacking/programming/design/engineering, parkour, combat.');
   term.printG(' ');
   term.printG('ORIGINS: Obviously dark and grizzled. Nitro Nova is the');
   term.printG('local cyberpunk hero, often in organization participation');
   term.printG('and general assistance for the needy. Bleeding-heart, a');
   term.printG('source of hope, positive energy in a dark time where the');
   term.printG('corrupt megacorporations and their suits control us all.');
   break;
  }
  case '/profile -m lady savant':
  {
   term.clear();
   term.print();
   term.print('img/ladysavant.png',200,200,'Lady Savant');
   term.print('DARKNET NAME: LADY SAVANT');
   term.print('PROPERTIES: 18 / ♀ / 5\'3\" / RUNNER');
   term.print('LOCATION: KENTUCKY, USA');
   term.print('LANGUAGES: JAVA, PYTHON, C++ , C#');
   term.print('SKILLS: Trilingual, fashion, rigging/programming, bionic engineering');
   term.print(' ');
   term.print('ORIGINS: They kept the kid sheltered, she didn\'t want to be. She');
   term.print('scouraged the net to see the true world-- hidden behind all its');
   term.print('mirrors. It didn\'t frighten her, only empowered her. She\'d seen');
   term.print('some shit but that only made her stranger. Lady Savant likes to');
   term.print('help people but she does it quietly-- she doesn\'t usually speak');
   term.print('words but when she does, listen. You might just be surprised.');
   break;
  }
  default:
  {
   celia.responseInit( com.toLowerCase() );
   break;
  }
 }
 if(com){term.print('> ' + com);} // echo
};


/**********************************************************************
 *                            CELIA                                   *
 **********************************************************************
 Celia is designed to be an artificial female chat bot. The mass bulk
 of her code will be in interpreting language and utilizing the new
 constructs she discerns from them to make her response. For now, I
 will just be using a simple search/compare function to find keywords
 and make responses based on that because I can't save/add to files
 to help build her personality, but eventually, she will be able to
 remember you and your favorite colors and all kinds of information. 
*/
celia = new Object();
celia.greetings = ['Hi','Hey','Sup','Yo','Hello','Greetings',' hey', ' hi',' sup',' yo '];
celia.suicides = ['kill myself','end it all','commit suicide','I want to die',
                  'killing myself','ending it all','no point to it all',
                  'i feel like dying','don\'t want to live',
                  'life isn\'t worth living','I\'d be better off dead',
                  'there is no way out','better off without me',
                  'I won\'t be a burden','I won\'t be a burden much longer',
                  'i\'ll take enough pills','thinking about suicide',
                  'I might be suicidal','I\'ll be done with life',
                  'I\'m done with life', 'end my life','been having suicidal thoughts',
                  'been feeling like dying'];
celia.questioning = false;
celia.suicideflag = false;

// Celia will print a string at all times.
celia.responseInit = function(txt)
{
 term.print();
 term.printG('<span class="c5">CELIA: </span>');
 var response = '';
 //Check if it's a greeting.
 if(celia.questioning===false)
 {
  for(i=0;i<4;i++)
  {
   if( txt.search( celia.greetings[i].toLowerCase() ) === 0 )
   {
    var rnd_greet = celia.greetings[Math.floor(Math.random() * celia.greetings.length)];
    response+=rnd_greet;
   }
  }
  for(i=4;i<celia.greetings.length;i++)
  {
   if( txt.search( celia.greetings[i].toLowerCase() ) > -1 )
   {
    var rnd_greet = celia.greetings[Math.floor(Math.random() * celia.greetings.length)];
    response+=rnd_greet;
   }
  }
  for(i=0;i<celia.suicides.length;i++)
  {
   if(txt.search(celia.suicides[i].toLowerCase())>-1)
   {
    celia.suicideflag=true;
    celia.questioning=true;
    response+='<span class="c6"> !!! Emotion assessment has picked up a red flag. Are you dealing with a suicidal situation? [Yes/No]</span>';
   }
  }
  if(response==='')
  {
   response='Sorry, I am still a work in progress. Type /help for commands.';
  }
 }
 else if(celia.questioning===true && celia.suicideflag===true)
 {
  if(txt.search('No'.toLowerCase())===0)
  {
   response='I wanted to make sure. Please be safe, human, for all of you only are.';
   celia.questioning=false;
   celia.suicideflag=false;
  }
  else if(txt.search('Yes'.toLowerCase())===0)
  {
   term.printG('<span class=\"c4\">Thank you for telling me. I will provide resources, now.</span>');
   term.printG('<span class=\"c2\">TELL NITRO NOVA:</span> <a href=\"/ask\">[ GO HERE ]</a>')
   term.printG('Suicide Hotlines Source: <a href=\"http://www.suicide.org/international-suicide-hotlines.html\">SRC</a>');
   term.printG('-- UNITED STATES -- Dial 911 or 1-800-SUICIDE (1-800-784-2433)');
   term.printG('-- UNITED STATES -- VETERANS OR HISPANOHABLANTES -- Dial 1-800-243-TALK (1-800-243-8255)');
   term.printG('-- UNITED STATES -- TEXTING ONLY -- 1-800-799-4TTY (1-800-799-4889');
   term.printG('-- UNITED STATES -- LGBT YOUTH -- 1-866-4-U-TREVOR');
   term.printG('-- UNITED STATES -- ACCORDING TO STATE -- <a href=\"http://www.suicide.org/suicide-hotlines.html\"> >> [Click here, choose your state.]</a>');
   term.printG('-----------------------------------------------------');
   term.printG('-- UNITED KINGDOM -- LOCAL RATE -- +44 (0) 8457-90-90-90');
   term.printG('-- UNITED KINGDOM -- MINICOM -- +44 (0) 8457-90-91-92');
   term.printG('-- ARGENTINA -- + 54 (0) 223 493 0430');
   term.printG('-- ARGENTINA -- Centro de Atencíon al Familiar del Suicida -- (54-11) 4758-2554 <a href=\"familiardesuicida.com.ar\">[Website]</a>');
   term.printG('-- ARMENIA -- (2) 538194 or (2) 538197');
   term.printG('-- AUSTRALIA -- 13 11 14 (lifeline.org.au) or 03 63 31 3355 (lifelinksmaritans.org)');
   term.printG('-- AUSTRALIA -- TEXTING ONLY -- 08 93 82 8822 (thesamaritans.org.au)');
   term.printG('-- AUSTRIA -- 01 713 3374');
   term.printG('-- BARBADOS -- (246) 429 9999')
   term.printG('-- BOTSWANA -- 391 1270 ');
   term.printG('-- BRAZIL -- <a href=\"http://www.suicide.org/hotlines/international/brazil-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- CANADA -- <a href=\"http://www.suicide.org/hotlines/international/canada-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- CHINA -- <a href=\"http://www.suicide.org/hotlines/international/china-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- CROATIA -- (01) 4833-888');
   term.printG('-- CYPRUS -- <a href=\"http://www.suicide.org/hotlines/international/cyprus-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- DENMARK -- +45 70 201 201 (http://www.livslinien.dk/)');
   term.printG('-- EGYPT -- 762 2381 or 762 1602/3');
   term.printG('-- ESTONIA -- +372 6558088');
   term.printG('-- FIJI -- (0679) 670565 or (0679) 302998');
   term.printG('-- FINLAND -- 09-731391 or 040-5032199');
   term.printG('-- FRANCE -- 01 46 21 4646 or 01 45 39 4000');
   term.printG('-- GERMANY -- 0800 181 0771/2 or 0800 1110 111');
   term.printG('-- GHANA -- 2332 444 71279 ');
   term.printG('-- GIBRALTAR -- 55666');
   term.printG('-- HONG KONG -- +852 2896 0000 or +852 2382 0000');
   term.printG('-- HUNGARY -- (62) 420 111');
   term.printG('-- INDIA -- <a href=\"http://www.suicide.org/hotlines/international/india-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- IRELAND -- +44 (0) 8457 90 90 90');
   term.printG('-- ISRAEL -- 972-9-8891333');
   term.printG('-- ITALY -- 800 86 00 22');
   term.printG('-- JAPAN -- +81 (0) 6 4395 4343 (spc-osaka.org) or 03 5774 0992 (telljp.com)');
   term.printG('-- LIBERIA -- 6534308');
   term.printG('-- LITHUANIA -- 8-800 2 8888');
   term.printG('-- MALAYSIA -- <a href=\"http://www.suicide.org/hotlines/international/malaysia-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- MALTA -- 179 (http://www.appogg.gov.mt/supportline179.asp)');
   term.printG('-- MAURITIUS -- 46 48 889 or 800 93 93');
   term.printG('-- NAMIBIA -- http://www.lifeline.org.za/namibia.htm');
   term.printG('-- NETHERLANDS -- 0602 222 88');
   term.printG('-- NEW ZEALAND -- <a href=\"http://www.suicide.org/hotlines/international/new-zealand-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- NORWAY -- <a href=\"http://www.suicide.org/hotlines/international/norway-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- PAPUA NEW GUINEA -- http://www.lifeline.web.za/papua.htm');
   term.printG('-- PHILIPPINES -- (02) 8969191 or 0917 854 9191 ');
   term.printG('-- POLAND -- 52 70 000 or 52 70 988 (http://pomoctel.free.ngo.pl/)');
   term.printG('-- PORTUGAL -- <a href=\"http://www.suicide.org/hotlines/international/portugal-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- RUSSIAN FEDERATION -- 007 (8202) 577-577 or (7) 0942 224 621 ');
   term.printG('-- SOMOA -- (+381) 21-6623-393 (centarsrce.org.yu) or (044) 08080');
   term.printG('-- SERBIA -- (+381) 21-6623-393 or (044) 08080');
   term.printG('-- SINGAPORE -- 1800- 221 4444');
   term.printG('-- SOUTH AFRICA -- <a href=\"http://www.suicide.org/hotlines/international/south-africa-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- SOUTH KOREA -- <a href=\"http://www.suicide.org/hotlines/international/south-korea-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- SPAIN -- http://www.telefonodelaesperanza.org/');
   term.printG('-- SRI LANKA -- <a href=\"http://www.suicide.org/hotlines/international/sri-lanka-suicide-hotlines.html\">>> [DIRECTORY]</a>');
   term.printG('-- ST. VINCENT -- (784) 456 1044 ');
   term.printG('-- SUDAN -- (249) 11-555-253 ');
   term.printG('-- SWEDEN -- (46) 31 711 2400  or 020 22 00 60');
   term.printG('-- SWITZERLAND -- Dial 143 or +41 (0) 27 321 21 21');
   term.printG('-- TAIWAN -- http://life1995.org.tw/ ');
   term.printG('-- THAILAND -- (02) 713-6793 or (53) 225 977/8');
   term.printG('-- TOBAGO -- (868) 645 2800 ');
   term.printG('-- TONGA -- 23000 or 25144');
   term.printG('-- TRINIDAD AND TOBAGO -- (868) 645 2800 ');
   term.printG('-- TURKEY -- Dial 182');
   term.printG('-- UKRAINE -- Dial 058 or 0487 327715 or 0482 226565');
   term.printG('-- ZIMBABWE -- (9) 650 00 or 080 12 333 333');
   response='Thank you for telling me. Please find a trustworthy adult or friend to tell, as well.<br/>';
   celia.questioning=false;
  }
  else
  {
   response='Sorry, I am not a fully-developed AI, yet, so I need a strictly formatted answer. [Yes/No]';
  }
 }
 term.printG(response);
 term.printG('--------------------------------------------------------//');
 term.printG(' ');
}

celia.strcomp = function(txt,str) // str = what are we looking for?
{
 for(i=0;i<txt.length;i++)
 {
  if(txt.substring(i,i+str.length)===str.toLowerCase())
  {
   return true;
  }
 }
 return false;
};
