$(document).ready(function() {
    console.log("Fishing Game Script Loaded!");

    $('#Stage').html("<H2 align='center'>Loading...</H2>");
    // Initial Experiment Parameters
    var ThisMobile = 0;
    var md = new MobileDetect(window.navigator.userAgent);
    if (md.mobile()) {
        ThisMobile = 1;
        console.log('phone');
    }

    var NumTrials = 5; // Number of trials per block
    var NumBlocks = 6; // Total number of blocks
    var TotalRewards = 0;  // Cumulative rewards for Blocks 1, 2, and 3
    var TotalAttempts = 0; // Cumulative attempts for Blocks 1, 2, and 3
    var TrialCounter = 0; // Tracks total trials across blocks
    var ParticipantResponses = []; // Stores participant's responses to the probability estimates
    var AssessmentResponses = []; // Internal tracking array for assessment responses
    var taskID = randomString(16); // Generate a random task ID
    

    // Probabilities for lakes in each dyad
    var Dyad1_Probabilities = [
        [0.8, 0.2], // Block 1
        [0.8, 0.2], // Block 2 
        [0.8, 0.2],// Block 3
        [0.2, 0.8],//block 4 (switched)
        [0.2, 0.8],//block 5
        [0.2, 0.8]  // Block 6 
    ];

    var Dyad2_Probabilities = [
        [0.8, 0.2], // Remains the same across all blocks
        [0.8, 0.2],
        [0.8, 0.2],
        [0.8, 0.2],
        [0.8, 0.2],
        [0.8, 0.2]
    ];

    var LakeImage = ["Lake01", "Lake02", "Lake03", "Lake04"];
    var LakeName = ["כוכב", "עפיפון", "בייגל", "טרק"];

    var TrialSequence = [];
    var SumReward = 0;
    var Init = (new Date()).getTime();
    var SubID = CreateCode();

    // Show Instruction Page 1
    function showInstructionsPage1() {
        console.log("Showing Instructions Page 1");
        $('#Stage').empty();
        $('#Stage').html(`
            <H2 align="center" dir="rtl">Instructions</H2>
            <p dir="rtl">ברוכים הבאים למטלת חופשת הדייג!</p>
            <p dir="rtl">במהלך החופשה תצאו לשש חופשות דייג בנות 20 ימים
            <p dir="rtl">בכל יום תצטרכו לבחור אגם לדוג בו מבין שני אגמים שונים.</p>
            <p dir="rtl">המטרה שלכם היא לדוג כמה שיותר דגים.</p>
            <img src="images/Inst1.png" class="img-responsive center-block" style="max-width: 50%; margin: 20px auto;">
            <button id="nextPage" class="btn btn-primary center-block">הבא</button>
        `);

        $('#nextPage').click(function() {
            showInstructionsPage2(); // Go to Page 2
        });
    }

    // Show Instruction Page 2
    function showInstructionsPage2() {
        $('#Stage').empty();
        $('#Stage').html(`
            <H2 align="center" dir="rtl">Instructions</H2>
            <p dir="rtl">לאחר כל בחירה שלכם תראו האם הצלחתם לדוג דג עסיסי או נכשלתם.</p>
            <p dir="rtl">
            <img src="images/Inst2.png" class="img-responsive center-block" style="max-width: 50%; margin: 20px auto;">
            <button id="backPage" class="btn btn-secondary center-block">חזרה</button> 
            <button id="startExperiment" class="btn btn-primary center-block">התחל ניסוי</button>
        `);
        
        $('#backPage').click(function () {
            showInstructionsPage1(); // Go back to Page 1
        });

        $('#startExperiment').click(function() {
            Block(0); // Start the first block of the experiment
        });
    }

    // Generate trial sequence
    function generateTrialSequence(blockNum) {
        var sequence = [];
        for (var i = 0; i < NumTrials; i++) {
            var dyad = i % 2 === 0 ? 1 : 2; // Alternate dyads
            var probabilities = dyad === 1 ? Dyad1_Probabilities[blockNum] : Dyad2_Probabilities[blockNum];
            sequence.push({
                dyad: dyad,
                probabilities: probabilities,
                position: Math.random() < 0.5 ? "left" : "right" // Randomize positions
            });
        }
        return sequence;
    }

    for (var blockNum = 0; blockNum < NumBlocks; blockNum++) {
        TrialSequence.push(generateTrialSequence(blockNum));
    }

    function showBreakPage(blockNum) {
        $('#Stage').empty();
        $('#Stage').html(`
            <H2 align="center" dir="rtl">אתם עומדים להתחיל חופשה חדשה!</H2>
            <p dir="rtl">סיימתם את חלק ${blockNum} מתוך ${NumBlocks}.</p>
            <p dir="rtl">לחצו על הכפתור למטה כדי להמשיך לחלק הבא.</p>
            <button id="startNextBlock" class="btn btn-primary center-block">התחל חלק ${blockNum + 1}</button>
        `);
    
        $('#startNextBlock').click(function () {
            var trials = TrialSequence[blockNum];
            runTrials(trials, blockNum, 0); // Start the trials for the current block
        });
    }

    function Block(blockNum) {
        if (blockNum > 0) {
            showBreakPage(blockNum);
        } else {
            var trials = TrialSequence[blockNum];
            runTrials(trials, blockNum, 0); // Start the trials for the current block
        }
    }

    function runTrials(trials, blockNum, trialIndex) {
        // Check if it's time for an assessment
        if (TrialCounter % 10 === 0 && TrialCounter !== 0 && !assessmentCompleted) {
            console.log("Starting assessment pages...");
            assessmentCompleted = true; // Set flag to prevent repeat assessments
            showAssessmentPages(trials, blockNum, trialIndex);
            return;
        }
    
        // Reset the flag after assessment
        if (TrialCounter % 10 !== 0) {
            assessmentCompleted = false;
        }
    
        // Check if all trials in the block are completed
        if (trialIndex >= trials.length) {
            console.log(`Block ${blockNum + 1} completed.`);

            // Log the assessment responses at the end of the experiment
            console.log("Assessment Responses: ", AssessmentResponses);

            if (blockNum + 1 < NumBlocks) {
                Block(blockNum + 1); // Move to the next block
            } else {
                End(); // End the experiment
            }
            return;
        }
    
        // Proceed with the trial
        console.log(`Running trial ${trialIndex + 1} of Block ${blockNum + 1}`);
        TrialCounter++; // Increment trial counter for every trial
        var trial = trials[trialIndex];
        Options(blockNum, trialIndex, trial); // Show trial options
    }

    function Options(blockNum, trialIndex, trial) {
        $('#Stage').empty();
        $('#Bottom').empty();
    
        var lake1 = trial.dyad === 1 ? LakeImage[0] : LakeImage[2];
        var lake2 = trial.dyad === 1 ? LakeImage[1] : LakeImage[3];
        var prob1 = trial.probabilities[0];
        var prob2 = trial.probabilities[1];
    
        var leftLake = trial.position === "left" ? lake1 : lake2;
        var rightLake = trial.position === "left" ? lake2 : lake1;
    
        var leftLakeName = trial.position === "left" ? LakeName[LakeImage.indexOf(leftLake)] : LakeName[LakeImage.indexOf(rightLake)];
        var rightLakeName = trial.position === "left" ? LakeName[LakeImage.indexOf(rightLake)] : LakeName[LakeImage.indexOf(leftLake)];
    
        var Title = '<H2 align="center" dir="rtl">בחרו אגם:</H2>';
        var Images = `<div class="row">
                        <div class="col-sm-6" id="LeftImage">
                            <img id="Door1" src="images/${leftLake}.png" class="img-responsive center-block" style="width: 80%; height: auto;">
                            <p dir="rtl" align="center" style="font-size: 18px; font-weight: bold;">${leftLakeName}</p>
                        </div>
                        <div class="col-sm-6" id="RightImage">
                            <img id="Door2" src="images/${rightLake}.png" class="img-responsive center-block" style="width: 80%; height: auto;">
                            <p dir="rtl" align="center" style="font-size: 18px; font-weight: bold;">${rightLakeName}</p>
                        </div>
                      </div>`;
    
        $('#Stage').html(Title + Images);
    
        $('#Door1').click(function () {
            handleChoice(blockNum, trialIndex, trial.dyad, 1, prob1);
        });
    
        $('#Door2').click(function () {
            handleChoice(blockNum, trialIndex, trial.dyad, 2, prob2);
        });
    }

    function handleChoice(blockNum, trialIndex, dyad, choice, probability) {
        $('#Stage').empty();
    
        var reward = Math.random() < probability ? 1 : 0;
        SumReward += reward;
    
        if (blockNum < 3) {  // Only track for Blocks 1, 2, and 3
            TotalRewards += reward;
            TotalAttempts++;
        }
    
        // Get the trial information
        var trial = TrialSequence[blockNum][trialIndex];
        var chosenSide = choice === 1 ? "left" : "right";
        
        // Determine which lake was on which side
        var leftLake = trial.position === "left" ? 
            (trial.dyad === 1 ? LakeImage[0] : LakeImage[2]) : 
            (trial.dyad === 1 ? LakeImage[1] : LakeImage[3]);
        
        var rightLake = trial.position === "left" ? 
            (trial.dyad === 1 ? LakeImage[1] : LakeImage[3]) : 
            (trial.dyad === 1 ? LakeImage[0] : LakeImage[2]);
        
        var chosenLake = choice === 1 ? leftLake : rightLake;
    
        // Send trial data
        sendTrialData({
            subjectID: SubID,
            dateTime: new Date().toISOString(),
            taskID: taskID,
            blockNum: blockNum + 1,
            trialNum: TrialCounter,
            leftLake: leftLake,
            rightLake: rightLake,
            chosenSide: chosenSide,
            chosenLake: chosenLake,
            reward: reward
        });
    
        var resultMessage = reward ? "הצלחת לדוג דג!" : "לא הצלחת היום.";
        var resultImage = reward ? "images/fish.png" : "images/got_nothing.png";
    
        $('#Stage').html(`
            <H2 align="center" dir="rtl">${resultMessage}</H2>
            <img src="${resultImage}" class="img-responsive center-block" style="max-width: 50%; margin: 20px auto;">
        `);
        setTimeout(function () {
            runTrials(TrialSequence[blockNum], blockNum, trialIndex + 1);
        }, 1500);
    }

    // Show Assessment Pages for the participant to estimate probabilities
    function showAssessmentPages(trials, blockNum, trialIndex) {
        var lakes = [LakeImage[0], LakeImage[1], LakeImage[2], LakeImage[3]]; // Two from each dyad
        var lakeNames = ["כוכב", "עפיפון", "בייגל", "טרק"]; // Corresponding lake names
        var currentPage = 0; // Track the current page being shown
    
        // Function to display each lake
        function showPage(pageIndex) {
            $('#Stage').empty();
            $('#Stage').html(`
                <H2 align="center" dir="rtl">הערכת סיכויים</H2>
                <p dir="rtl">מה הסיכוי לקבל דג באגם זה?</p>
                <img src="images/${lakes[pageIndex]}.png" class="img-responsive center-block" style="max-width: 50%; margin: 20px auto;">
                <p dir="rtl" align="center">${lakeNames[pageIndex]}</p>
                <input type="range" id="probabilitySlider" min="0" max="100" value="50" step="1" style="width: 80%; margin: 20px auto;">
                <p dir="rtl" align="center">הערכה: <span id="sliderValue">50%</span></p>
                <button id="nextPage" class="btn btn-primary center-block">הבא</button>
            `);
    
            // Update slider value dynamically
            $('#probabilitySlider').on('input', function () {
                $('#sliderValue').text($(this).val() + '%');
            });
    
            // Handle next button click
            $('#nextPage').off('click').on('click', function () {
                // Save the response for the current lake
                AssessmentResponses.push({
                    lake: lakes[pageIndex],
                    probability: $('#probabilitySlider').val() / 100
                });
    
                currentPage++;
                if (currentPage < lakes.length) {
                    showPage(currentPage);
                } else {
                    // After all assessment pages are completed
                    console.log("Assessment completed.");
                    runTrials(TrialSequence[blockNum], blockNum, trialIndex);
                }
            });
        }
    
        showPage(currentPage); // Start the assessment pages
    }

    // Function to End the experiment
    function End() {

        // Send the last trial data
        sendTrialData();
        console.log("Experiment completed.");
        $('#Stage').html(`
            <H2 align="center" dir="rtl">סיום הניסוי</H2>
            <p dir="rtl">תודה רבה על השתתפותכם! סיימתם את הניסוי.</p>
            <p dir="rtl">סיימת בהצלחה! הנתונים שלכם נשמרו.</p>
        `);
    }

    // Helper function to generate a unique ID for the participant
    function CreateCode() {
        var code = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 10; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }
    function sendTrialData(data) {
        $.ajax({
            type: "POST",
            url: "/insert_trial_data",
            data: data,
            success: function (response) {
                console.log("Trial data sent successfully:", response);
            },
            error: function (xhr, status, error) {
                console.error("Error sending trial data:", error);
                console.error("Trial data that failed to send:", data);
            }
        });
    }

    showInstructionsPage1(); // Start the experiment
});
