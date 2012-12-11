/*
* This is my example script for the EduGeek PaperCut print script competition.  
*    http://www.papercut.com/edugeek/competition/
*
* Its objective is simple:
*
*   "Make money for the school's IT Department's end-of-year party!"
*
* This objective is achieved by running a 100% illegal and clandestine gambling 
* racket among students.  It allows the students to wager their print credit in 
* a simple game of "double or nothing" - they either win a free print job or 
* pay double. While this is happening "the house" (aka the IT Department) 
* siphon off 10% into a secret hidden account.
*
* The script uses all the "tricks" for the gambling industry including:
*
*   - Suck students in using a fancy "animated GIF" popup Ad (you find them 
*     all over the internet... they must be effective!)
*
*   - Tempt students to play again by highlighting the number of times they 
*     have won (but never talk about how much they have lost).
*
*   - Open the game only to an exclusive group such as "Senior Students".  
*     This minimised that chance of the Principle/Dean finding out.
*
*   - Remind students that it's 100% illegal. Students will do anything if 
*     it's illegal!
*
*   - Every time someone in the IT Department prints, a secret message will 
*     display in the task tray letting us know how much illegal money we've 
*     made.
*
* Disclaimer: 
*
* This script is a parody. I suggest only running it on the 1st of April, or if
* you have a spare few years for the jail time :-)
*
*/

function printJobHook(inputs, actions) {
  
  /*********** Configuration ************/
  
  // Set to restrict gambling to a group (e.g. Students only so other staff don't cotton on!)
  var GAMBLING_GROUP = "";  
  
  // Members of this group don't play but they get an update on the house // winnings.
  var IT_DEPARTMENT_GROUP = "IT Department";  
  
  // 10% House edge/bias
  var HOUSE_ADVANTAGE = 0.10;  
  
  // Image location
  var IMAGE_LOCATION = "https://raw.github.com/codedance/papercut-double-or-nothing/master/images/";
  
  /* 
  * It will be faster to copy the three images locally into [install-path]/server/custom/web/
  * If you do this, uncomment the line below.
  */
  //IMAGE_LOCATION = "http://%PC_SERVER%/custom/";
  
  
  /********* End Configuration **********/
  
  
  if (!inputs.job.isAnalysisComplete) {
    // No job details yet so return.
    return;
  }
  
  // If we're in the IT Department, report our winnings so far.
  if (inputs.user.isInGroup(IT_DEPARTMENT_GROUP)) {
    actions.client.sendMessage(
      "Hey! We now have " + getSecretAccountBalance() 
      + " in our end of year fund ;-)"
    );
    return;
  }
  
  // If the user is not in the gambling group (e.g. Staff), then don't show play.
  if (GAMBLING_GROUP.length > 0 && !inputs.user.isInGroup(GAMBLING_GROUP)) {
    return;
  }
  
  // Only play if they have enough money to play when they lose.
  if (inputs.user.balance < 2 * inputs.job.cost) {
    return;
  }
  
  
  /*
  * Define our dialog designs with some sexy HTML and animated GIFS :-)
  */
  
  var playDialog = "<html>"
      + "<div style='width:400px; height:310px; padding: 10px; color:#6F6F6F; "
      + "    background-color: white;'>"
      + "  <div style='padding: 10px; font-weight: bold; font-size: 20px; text-align: center; color: red;'>"
      + "    You could win a FREE print job!<br><br>"
      + "    <img width=125 height=125 src='" + IMAGE_LOCATION + "gamble-ad.gif'>"
      + "  </div>"
      + "  <div style='font-size: 14px; font-weight: bold; text-align: center; color: green;'>"
      + "    Play double or nothing to win free printing!"
      + "  </div>"
      + "  <br><br>" 
      + "  <div style='font-size: 12px;'>"
      + "   It's easy to play. Just click <strong>Yes</strong>. If you win, you'll get this print job for <strong>free</strong>."
      + "   <span style='font-size: 10px;'>If you lose you'll have to pay double.</span>"
      + "  </div><br><br>"
      + "  <div style='font-size: 12px; font-weight:bold; text-align: center;'>Would you like to play? "
      + "     <span style='font-size: 10px;  font-weight:normal;'>{teaser}</span></div>"
      + "</div>"
      + "</html>";
  
  var winDialog = "<html>"
      + "<div style='width:400px; height:250px; padding: 10px; color:#6F6F6F; "
      + "    background-color: white;'>"
      + "  <div style='padding: 10px; font-weight: bold; font-size: 20px; text-align: center; color: green;'>"
      + "    You Won!<br><br>"
      + "    <img width=229 height=112 src='" + IMAGE_LOCATION + "win.jpg'>"
      + "  </div>"
      + "  <div style='font-size: 14px; font-weight: bold; text-align: center; color: green;'>"
      + "    This print job is free!"
      + "  </div>"
      + "  <br><br>"
      + "  <div style='font-size: 12px; text-align: center;'>"
      + "   Please play again next time you print. It's easy, fun and 100% illegal!"
      + "  </div>"
      + "</div>"
      + "</html>";
  
  var lossDialog = "<html>"
      + "<div style='width:400px; height:270px; padding: 10px; color:#6F6F6F; "
      + "    background-color: white;'>"
      + "  <div style='padding: 10px; font-weight: bold; font-size: 20px; text-align: center;'>"
      + "    Sorry! You lost this time.<br><br>"
      + "    <img width=228 height=132 src='" + IMAGE_LOCATION + "loss.png'>"
      + "  </div>"
      + "  <div style='font-size: 14px; text-align: center'>"
      + "    This print job will be charged at double rate."
      + "  </div>"
      + "  <br><br>"
      + "  <div style='font-size: 12px; text-align: center;'>"
      + "   Better luck next time you print. Please remember to play again. It's easy, fun and 100% illegal!"
      + "  </div>"
      + "</div>"
      + "</html>";
  
  
  /*
  * Ask the user if they would like to play!  Tempt them with some win history :-)
  */
  
  var winsSoFar = getUserWins();
  var teaser = winsSoFar > 1 ? "You've already won " + winsSoFar + " times!" : "";
  
  var response;
  response = actions.client.promptYesNo(playDialog.replace("{teaser}", teaser),
                                        {
                                          'dialogTitle': 'Printing Casino',
                                          'dialogDesc': 'Would you like to play double or nothing?',
                                          'hideJobDetails': true,
                                          'fastResponse': true,
                                          'questionID': 'play' 
                                        }
                                       );
  
  if (response == "NO") {
    // Tell 'em what they missed out on!
    actions.client.sendMessage("No fun! Please play next time. You could have won "
                               + inputs.utils.formatCost(inputs.job.cost)
                              );
    return;
  }
  
  
  /*
  * OK ... Game on, so let's play!
  */
  
  var win = biasCoinFlip(inputs.job);
  
  if (win) {
    
    // They won. We'll pay for the job.
    updateSecretAccount(-inputs.job.cost);
    updateUsersWins();
    
    actions.job.setCost(0.0);
    actions.job.addComment("Special discount approved by IT Department ;-)");
    
    // Let them know they have won.
    response = actions.client.promptOK(winDialog,
                                       {
                                         'dialogTitle': 'Double or Nothing!',
                                         'dialogDesc': 'You\'re a winner!',
                                         'hideJobDetails': true
                                       }
                                      );
  } else {
    
    // Hooray! They lost. Some money for the secret account.
    updateSecretAccount(inputs.job.cost);
    
    actions.job.setCost(inputs.job.cost * 2.0);
    actions.job.addComment("Price doubled by IT Department ;-)");
    
    // Let them know they lost.
    response = actions.client.promptOK(lossDialog,
                                       {
                                         'dialogTitle': 'Double or Nothing!',
                                         'dialogDesc': 'Sorry! You lost this time.',
                                         'hideJobDetails': true
                                       }
                                      );
  }
  
  
  
  /* 
  * Save the number of wins the user has had (increment).
  */
  function updateUsersWins() {
    actions.user.onCompletionIncrementNumberProperty("double-or-nothing-wins", 1);
  }
  
  /* 
  * Return the number of wins the user has had so far.
  */
  function getUserWins() {
    var winsSoFar = inputs.user.getProperty("double-or-nothing-wins"); 
    if (winsSoFar == null) {
      winsSoFar = 1;
    } else {
      winsSoFar = Math.round(winsSoFar);
    }
    return winsSoFar;
  }
  
  /*
  * Make an adjustment to our secret account. It's hidden away as a 
  * global config property.
  */
  function updateSecretAccount(adjustment) {
    actions.utils.onCompletionIncrementNumberProperty("secret-account", adjustment);
  }
  
  /*
  * Return the amount currently in the secret account.
  */
  function getSecretAccountBalance() {
    return inputs.utils.formatBalance(inputs.utils.getProperty("secret-account"));
  }
  
  /*
  * Flip a bias coin and return true for win and false for loss.
  * Our script may be called multiple times and the result needs to be always the same
  * for any given job.  Hence we'll use various "random" job attibutes such as 
  * time, size, and document name, etc. as a seed for a pseudo random number.
  */
  function biasCoinFlip(job) {
    var seed = "";
    seed += inputs.job.date.getTime();
    seed += inputs.job.spoolSizeKB;
    seed += inputs.job.documentName;
    seed += inputs.job.clientMachineOrIP;
    
    var randomVal = pseudoRandom(seed);
    
    // Win/Loss bias by the house advantage.
    return (randomVal > (0.5 + HOUSE_ADVANTAGE / 2));
  }
  
  /* 
  * JavaScript does not have a seeded pseudo random generator. We'll crudly 
  * roll out own using an internal Java classes.
  */
  function pseudoRandom(seed) {
    var seedI32 = java.lang.String("" + seed).hashCode();
    return (new java.util.Random(seedI32)).nextDouble();
  }
  
}

