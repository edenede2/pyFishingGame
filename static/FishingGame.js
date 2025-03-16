$(document).ready(function() {
    try {
        console.log("Starting initialization...");

        // Add the missing randomString function
        function randomString(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }

        $('#Stage').html("<H2 align='center'>Loading...</H2>");
        // Initial Experiment Parameters
        var ThisMobile = 0;
        var md = new MobileDetect(window.navigator.userAgent);
        if (md.mobile()) {
            ThisMobile = 1;
            console.log('Mobile device detected');
        }

        var participantName = ""; // Participant's name
        var NumTrials = 20; // Number of trials per block
        var NumBlocks = 6; // Total number of blocks
        var TotalRewards = 0;  // Cumulative rewards for Blocks 1, 2, and 3
        var TotalAttempts = 0; // Cumulative attempts for Blocks 1, 2, and 3
        var TrialCounter = 0; // Tracks total trials across blocks
        var ParticipantResponses = []; // Stores participant's responses to the probability estimates
        var AssessmentResponses = []; // Internal tracking array for assessment responses
        var taskID = randomString(16); // Generate a random task ID
        var currentBlockRewards = 0;
        var currentBlockTrials = 0;
        var extraTrialsAdded = false; // Flag to track if extra trials have been added
        var failedLearningCondition = false; 

        // Probabilities for lakes in each dyad
        var Dyad1_Probabilities = [
            [0.8, 0.2], // Block 1
            [0.8, 0.2], // Block 2 
            [0.8, 0.2],// Block 3
            [0.2, 0.8],//block 4 (switched)
            [0.2, 0.8],//block 5
            [0.2, 0.8]  // Block 6 
        ];

        // var Dyad1_Probabilities = [
        //     [1, 0], // Block 1
        //     [1, 0], // Block 2 
        //     [1, 0],// Block 3
        //     [1, 0],//block 4 (switched)
        //     [1, 0],//block 5
        //     [1, 0]  // Block 6 
        // ];

        var Dyad2_Probabilities = [
            [0.8, 0.2], // Remains the same across all blocks
            [0.8, 0.2],
            [0.8, 0.2],
            [0.8, 0.2],
            [0.8, 0.2],
            [0.8, 0.2]
        ];

        var LakeImage = ["Lake01", "Lake05", "Lake03", "Lake04"];
        var LakeName = ["כוכב", "עפיפון", "בייגל", "טרק"];

        var TrialSequence = [];
        var SumReward = 0;
        var Init = (new Date()).getTime();
        // var SubID = CreateCode();


        // Show Name Input Page as Instruction Page 1
        function showNameInputPage() {
            $('#Stage').empty();
            $('#Stage').html(`
                <H2 align="center" dir="rtl">ברוכים הבאים לניסוי</H2>
                <p dir="rtl" align="center">אנא מלא את שמך המלא</p>
                <input type="text" id="participantName" class="form-control center-block" style="width: 50%; margin: 10px auto;" placeholder="שם מלא">
                <button id="submitName" class="btn btn-primary center-block" style="margin-top: 20px;">התחל</button>
                <p id="nameError" class="text-danger" style="display: none; text-align: center;">יש להזין שם לפני ההמשך</p>
            `);

            $('#submitName').click(function () {
                participantName = $('#participantName').val().trim(); // Update the global variable
                if (participantName) {
                    console.log("Participant Name:", participantName);
                    showInstructionsPage1(); // Proceed to Instructions Page 2
                } else {
                    $('#nameError').show(); // Show error message if the input is empty
                }
            });
        }

        // Show Instruction Page 1
        function showInstructionsPage1() {
            console.log("Showing Instructions Page 1");
            $('#Stage').empty();
            $('#Stage').html(`
                <H2 align="center" dir="rtl">Instructions</H2>
                <p dir="rtl">ברוכים הבאים למטלת חופשת הדייג!</p>
                <p dir="rtl">במהלך החופשה תצאו לשש חופשות דייג בנות 20 ימים
                <p dir="rtl">בכל יום תצטרכו לבחור אגם לדוג בו מבין שני אגמים שונים. כל בחירה שלכם תזכה בדג או לא תזכה בכלום.</p>
                <p dir="rtl">המטרה שלכם היא לבחור באגם אשר יניב הכי הרבה דגים מבין השניים וכך לצבור את מרב הדגים!</p>
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
                // Determine lakes based on the dyad and block
                var lake1 = dyad === 1 ? LakeImage[0] : LakeImage[2]; // Dyad 1 uses Lake01, Dyad 2 uses Lake03
                var lake2 = dyad === 1 ? LakeImage[1] : LakeImage[3]; // Dyad 1 uses Lake02, Dyad 2 uses Lake04
        
                // Randomize left/right positioning of the lakes
                sequence.push({
                    dyad: dyad,
                    probabilities: probabilities,
                    leftLake: Math.random() < 0.5 ? lake1 : lake2,
                    rightLake: Math.random() < 0.5 ? lake2 : lake1
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
                showBreakPage(blockNum); // Show break page after Block 1
            } else {
                console.log("Starting Block 1..." + blockNum);
                if (blockNum < NumBlocks) {
                    var trials = TrialSequence[blockNum];
                    runTrials(trials, blockNum, 0); // Start the trials immediately
                } else {
                    End(); // End the experiment after Block 6
                }
            }
        }




        function checkLearningCondition() {
            var blockIndex = 2; // Block 3 (zero-based index)
            var blockTrials = TrialSequence[blockIndex]; // Get trials for Block 3
        
            var blockRewards = 0;
            var blockAttempts = blockTrials.length; // Total trials in Block 3
        
            // Count successes in Block 3
            for (var i = 0; i < blockAttempts; i++) {
                if (blockTrials[i].wasRewarded) { // Make sure 'wasRewarded' is set properly in trials
                    blockRewards++;
                }
            }
        
            // Calculate success rate after the loop
            var successRate = (blockRewards / blockAttempts) * 100;
        
            console.log(`Block 3 Success Rate: ${successRate}%`);
        
            if (successRate < 70 && !extraTrialsAdded) {
                console.log("Participant did not reach 70% success in Block 3. Adding 20 extra trials.");
                extraTrialsAdded = true; // Set flag to prevent adding extra trials again
                addExtraTrials();
            } else {
                console.log("Participant met the learning condition in Block 3. Moving to Block 4.");
                Block(3); // Proceed to Block 4
            }
        }
        
        
        
        
        // Function to add extra 20 trials before Block 4
        function addExtraTrials() {
            var extraTrials = generateTrialSequence(2).slice(0, 20); // Generate 20 additional trials from Block 3
            runTrials(extraTrials, 2, 0, function () {
                console.log("Extra trials completed. Moving to Block 4.");
                Block(3);
            });
        }


        function runTrials(trials, blockNum, trialIndex) {
            console.log("Running trials..." + blockNum);
            console.log("Trial Index: " + trialIndex);
            console.log("Trial Counter: " + TrialCounter);
            console.log("Total trials: " + trials.length);
            // Check if it's time for an assessment
            if (TrialCounter % 20 === 0 && TrialCounter !== 0 && !assessmentCompleted) {
                if (blockNum === 2 && failedLearningCondition) {
                    console.log("Skipping assessment due to failed learning condition.");
                    failedLearningCondition = false;
                    // runTrials(trials, blockNum, trialIndex); // Skip assessment and proceed with trials
                    
                }else {
                    console.log("Starting assessment pages...");
                    assessmentCompleted = true; // Set flag to prevent repeat assessments
                    showAssessmentPages(trials, blockNum, trialIndex);
                    return;
                }
                }
    
            // Reset the flag after assessment
            if (TrialCounter % 20 !== 0) {
                console.log("Assessment flag reset.");
                assessmentCompleted = false;
            }
    
            // Check if all trials in the block are completed
            if (trialIndex >= trials.length) {
                console.log(`Block ${blockNum + 1} completed.`);
                
                // Save the values of the assessment responses by the lake images
                assessments_res = [];
                for (var i = 0; i < AssessmentResponses.length; i++) {
                    assessments_res.push(AssessmentResponses[i].probability);
                }
                // Send block data before moving to next block
                sendBlockData({
                    subjectID: participantName,
                    dateTime: new Date().toISOString(),
                    taskID: taskID,
                    blockNum: blockNum + 1,
                    assessment_lake_01: assessments_res[0],
                    assessment_lake_02: assessments_res[1],
                    assessment_lake_03: assessments_res[2],
                    assessment_lake_04: assessments_res[3],
                    assessment_lake_05: assessments_res[4],
                    assessment_lake_06: assessments_res[5],
                    assessment_lake_07: assessments_res[6],
                    assessment_lake_08: assessments_res[7],

                    totalReward: currentBlockRewards,
                    totalTrials: currentBlockTrials
                });
                
                // Reset block-specific counters
                currentBlockRewards = 0;
                currentBlockTrials = 0;
                AssessmentResponses = []; // Clear assessment responses for next block

                // Log the assessment responses at the end of the experiment
                console.log("Assessment Responses: ", AssessmentResponses);

                if (blockNum === 2) { // ✅ Now we check the success rate AFTER Block 3 ends
                    checkLearningCondition();
                }
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
            // Assign images randomly to left/right
            var leftLake = Math.random() < 0.5 ? lake1 : lake2;
            var rightLake = leftLake === lake1 ? lake2 : lake1;
    
            
            // var leftLakeName = trial.position === "left" ? LakeName[LakeImage.indexOf(leftLake)] : LakeName[LakeImage.indexOf(rightLake)];
            // var rightLakeName = trial.position === "left" ? LakeName[LakeImage.indexOf(rightLake)] : LakeName[LakeImage.indexOf(leftLake)];
            trial.leftLake = leftLake;
            trial.rightLake = rightLake;

            var Title = '<H2 align="center" dir="rtl">בחרו אגם:</H2>';
            var Images = `<div class="row">
                            <div class="col-sm-6" id="LeftImage">
                                <img id="Door1" src="images/${leftLake}.png" class="img-responsive center-block" style="width: 80%; height: auto;">
                            </div>
                            <div class="col-sm-6" id="RightImage">
                                <img id="Door2" src="images/${rightLake}.png" class="img-responsive center-block" style="width: 80%; height: auto;">
                            </div>
                          </div>`;
    
            $('#Stage').html(Title + Images);
    
            $('#Door1').click(function () {
                handleChoice(blockNum, trialIndex, trial.dyad, trial.leftLake, 1, leftLake, rightLake);
            });
    
            $('#Door2').click(function () {
                handleChoice(blockNum, trialIndex, trial.dyad, trial.rightLake, 0, leftLake, rightLake);
            });
        }

        function handleChoice(blockNum, trialIndex, dyad, chosenLake, choiceBinary, leftLakeActual, rightLakeActual) {
            $('#Stage').empty();
            var probabilities = dyad === 1 ? Dyad1_Probabilities[blockNum] : Dyad2_Probabilities[blockNum];
            
            console.log("Probabilities:", probabilities);
            console.log("Chosen Lake:", chosenLake === 1 ? "left" : "right");
            console.log("Block Number:", blockNum);
            console.log("Trial Index:", trialIndex);
            console.log("Dyad:", dyad);
            console.log("Choice:", chosenLake);
            console.log("Choice Binary:", choiceBinary);
            var lakeIndex = (LakeImage.indexOf(chosenLake) % 2 === 0) ? 0 : 1; 
            var probability = probabilities[lakeIndex];


            var reward = Math.random() < probability ? 1 : 0;
            SumReward += reward;

            currentBlockRewards += reward;
            currentBlockTrials++;
    
            if (blockNum < 3) {  // Only track for Blocks 1, 2, and 3
                TotalRewards += reward;
                TotalAttempts++;
            }
    
            // Get the trial information
            var trial = TrialSequence[blockNum][trialIndex];
            var chosenSide = choiceBinary === 1 ? "left" : "right";
        
            // Determine which lake was on which side
            var leftLake = trial.position === "left" ? 
                (trial.dyad === 1 ? LakeImage[0] : LakeImage[2]) : 
                (trial.dyad === 1 ? LakeImage[1] : LakeImage[3]);
        
            var rightLake = trial.position === "left" ? 
                (trial.dyad === 1 ? LakeImage[1] : LakeImage[3]) : 
                (trial.dyad === 1 ? LakeImage[0] : LakeImage[2]);
        
            
            // var chosenLake = choiceBinary === 1 ? leftLake : rightLake;
            lakes_name_map = {
                "Lake01": "Star",
                "Lake05": "Pakman",
                "Lake03": "Circle",
                "Lake04": "Arrow"
            };

            sides_to_up_down_map = {
                "left": "up",
                "right": "down"
            };

            var chosenImage = lakes_name_map[chosenLake];

            // Send trial data
            sendTrialData({
                subjectID: participantName,
                dateTime: new Date().toISOString(),
                taskID: taskID,
                blockNum: blockNum + 1,
                trialNum: TrialCounter,
                leftLake: lakes_name_map[leftLakeActual],
                rightLake: lakes_name_map[rightLakeActual],
                chosenSide: sides_to_up_down_map[chosenSide],
                chosenLake: chosenImage,
                reward: reward
            });

            // Store if the trial was rewarded in the trial object for later success rate calculation
            TrialSequence[blockNum][trialIndex].wasRewarded = reward === 1;

            // Check if we've reached 20 trials in Block 3 and need to decide about extending
            if (blockNum === 2 && trialIndex === 19) { // Block 3 (zero-indexed) after 20 trials
                var block3SuccessRate = currentBlockRewards / 20;
                console.log(`Block 3 success rate after 20 trials: ${block3SuccessRate * 100}%`);
                
                if (block3SuccessRate < 0.7) {
                    console.log("Success rate below 70%. Extending Block 3 with 20 more trials.");
                    
                    // Generate 20 more trials with the same structure as current Block 3 trials
                    var extraTrials = generateTrialSequence(2); // Generate trials for Block 3
                    
                    // Add these trials to the current Block 3
                    TrialSequence[blockNum] = TrialSequence[blockNum].concat(extraTrials);
                    
                    console.log(`Block 3 extended to ${TrialSequence[blockNum].length} trials`);

                    failedLearningCondition = true;
                }
            }

            var resultMessage = reward ? "הצלחת לדוג דג!" : "לא הצלחת היום.";
            var resultImage = reward ? "images/fish.png" : "images/got_nothing.png";
            var imageSize = reward ? "50%" : "30%";

            $('#Stage').html(`
                <H2 align="center" dir="rtl">${resultMessage}</H2>
                <img src="${resultImage}" class="img-responsive center-block" style="max-width: ${imageSize}; margin: 20px auto;">
            `);
            setTimeout(function () {
                runTrials(TrialSequence[blockNum], blockNum, trialIndex + 1);
            }, 1500);
        } // This closing brace was missing in the original code

        // Show Assessment Pages for the participant to estimate probabilities
        function showAssessmentPages(trials, blockNum, trialIndex) {
            var lakes = [LakeImage[0], LakeImage[1], LakeImage[2], LakeImage[3]]; // Two from each dyad
            var lakeNames = ["כוכב", "פקמן", "בייגל", "חץ"]; // Corresponding lake names
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
            // Add participantName to the data object if it's not already present
            if (data) {
                data.participantName = participantName;
            }
            
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

        function sendBlockData(data){
            // if (data) {
            //     data.participantName = participantName;
            // }
            
            console.log("Sending block data:", data);
            
            $.ajax({
                type: "POST",
                url: "/insert_block_data",
                data: data,
                success: function (response) {
                    console.log("Block data sent successfully:", response);
                },
                error: function (xhr, status, error) {
                    console.error("Error sending block data:", error);
                    console.error("Block data that failed to send:", data);
                }
            });
        }

        console.log("Initialization complete, starting instructions...");
        showNameInputPage(); // Start the experiment

    } catch (error) {
        console.error("Initialization error:", error);
        $('#Stage').html("<H2 align='center'>Error loading game. Please refresh the page.</H2>");
    }
});
