        const useState = React.useState;
        const useEffect = React.useEffect;
        const useCallback = React.useCallback;
        const useReducer = React.useReducer;
        // helper function for shuffling deck
        const getRandomInt = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1) + min);
        };
        // main app component
        function App() {
            // state for tracking uploaded cards (to set Global Ids)
            const [cardsAdded, setCardsAdded] = useState(0);
            // state for tracking the next globalId for cards to-be-added
            const [globalIdCounter, setGlobalIdCounter] = useState(3);
            // state for tracking whether or not the card is flipped
            const [flipped, setFlipped] = useState(false);
            // state for tracking which cards in our deck are "active" status--might possibly be done with useEffect,
            // but these deck[index]/card-dependent states almost certainly would be better managed with React.Context.
            const [activeCards, setActiveCards] = useState([]);
            // state for tracking whether or not the filter is active (we can still activate and deactivate cards, regardless!)
            const [filtered, setFiltered] = useState(false);
            // sister state to the above tracking any cards with "filtered/inactive" status
            const [filteredCards, setFilteredCards] = useState([]);
            // state for tracking the index into our deck, determining which card is displayed.
            const [index, setIndex] = useState(0);
            // state for tracking our master deck (all active/inactive cards)--again we could probably elimiminate the need for three separate arrays
            // if we refactored this to use React.Context
            const [deck, setdeck] = useState(sampleDeck);
            // providing an initial state which we'll set again with useEffect on our Card component's receipt of any card data.
            // We could have made this an empty object, too, but then our .
            const [activeCard, setActiveCard] = useState({
                front: "sample",
                back: "sample"
            });

            // state for tracking form/menu visibility and text input focus (necessary for disabling hotkey behavior while entering text)
            const [showCardForm, setShowCardForm] = useState(false);
            const [showSaveForm, setShowSaveForm] = useState(false);
            const [inputActive, setInputActive] = useState(false);
            const [showFilterMenu, setShowFilterMenu] = useState(false);
            // key string values for our custom hotkey hook
            const nextKey = ["ArrowRight"];
            const prevKey = ["ArrowLeft"];
            const upKey = ["ArrowUp"];
            const downKey = ["ArrowDown"];
            // Is the filter active?
            // If so,
            // are there any cards in our activeCards array? T/F
            // This is only possible in the case of activating the filter with an empty deck--otherwise, it does not allow you to filter all cards
            // If not,
            // are there any cards in our master deck array? T/F
            const haveCards = filtered ?
                activeCards.length > 0 ?
                    true :
                    false :
                deck.length > 0 ?
                    true :
                    false;
            // any time we update the deck, make sure our Global ID reflects the changes.
            useEffect(() => {
                const snapshot = Array.from(deck);
                if (snapshot !== []) {
                    setGlobalIdCounter(snapshot.length);
                } else if (filtered) {
                    const count = activeCards.length + filteredCards.length;
                    setGlobalIdCounter(count);
                } else if (!filtered && snapshot === []) {
                    setGlobalIdCounter(0);
                }
            }, [activeCards.length, filteredCards.length, deck.length]);
            // helper to process options and data from AddCard component callback.
            const getFormData = options => {
                switch (options.operation) {
                    case "edit":
                        var editedDeck = [];
                        if (deck.length > 0) {
                            editedDeck = Array.from(deck);
                            editedDeck.map(item => {
                                if (item.id === options.data.id) {
                                    return Object.assign(item, options.data);
                                } else return item;
                            });
                        } else {
                            editedDeck = [options.data];
                        }
                        setDeck(editedDeck);
                        break;
                    case "add":
                        const addedDeck = Array.from(deck);
                        addedDeck.concat(options.data);
                        setDeck(prevDeck => prevDeck.concat(options.data));
                        break;
                    default:
                        throw new Error(`Unhandled operation: ${options.operation}`);
                }

            };
            // helper function for shuffling the deck
            const shuffleDeck = () => {
                const newDeck = [];
                for (let i = 0; i < deck.length; i++) {
                    if (window.CP.shouldStopExecution(0)) break;
                    const rand = Math.floor(Math.random() * (i + 1));
                    newDeck[i] = newDeck[rand];
                    newDeck[rand] = deck[i];
                } window.CP.exitedLoop(0);
                setDeck(newDeck);
            };
            // getter for Child text input status
            // (needed for disabling hotkeys)
            const getChildInputStatus = status => {
                setInputActive(status);
            };
            // getter for filter component status--
            // if active, we propagate filtered deck to children..
            const getFilterStatus = status => {
                setFiltered(status);
            };
            // with these helper functions!
            const getFilteredCards = cards => {
                setFilteredCards(cards);
            };
            const getActiveCards = cards => {
                setActiveCards(cards);
            };
            const getUpdatedDeck = newDeck => {
                setDeck(newDeck);
            };
            // helper for sending valid Global ID to AddCard component
            const sendNextId = n => {
                if (!n) {
                    if (deck !== [] && !filtered) {
                        const len1 = deck.length;
                        setGlobalIdCounter(len1);
                    } else if (filtered) {
                        const len = activeCards.length + filteredCards.length;
                        setGlobalIdCounter(len);
                    }
                } else {
                    if (n) {
                        setGlobalIdCounter(n);
                    }
                }
            };
            // helper for loading form data from SaveLoad component
            const loadCallback = options => {
                const op = options.operation;
                const data = options.data;
                switch (op) {
                    case "add":
                        const d = data;
                        const old = Array.from(deck);
                        const addedCount = d.length;
                        const pre = [...old, ...d];
                        const addedDeck = pre.map((obj, i) => {
                            if (obj.hasOwnProperty("active")) {
                                Object.assign(obj, {
                                    active: obj.active,
                                    id: i
                                });

                            } else {
                                Object.assign(obj, {
                                    active: true,
                                    id: i
                                });

                            }

                            return obj;
                        });

                        setCardsAdded(addedCount);
                        setDeck(addedDeck);
                        break;
                    case "replace":
                        const r = data;
                        const replaceCount = r.length;
                        const mapped = r.map((obj, i) => {
                            Object.assign(obj, {
                                active: true,
                                id: i
                            });


                            return obj;
                        });
                        setCardsAdded(replaceCount);
                        setDeck(mapped);
                        break;
                    default:
                        throw new Error(`Unhandled operation: ${options.operation}`);
                }

            };

            const nextCard = () => {
                if (index + 1 === deck.length) {
                    setIndex(0);
                } else {
                    setIndex(index + 1);
                }
            };

            const prevCard = () => {
                const len = filtered ? activeCards.length - 1 : deck.length - 1;
                if (index - 1 >= 0) {
                    setIndex(index - 1);
                } else {
                    setIndex(len);
                }
            };

            const deleteDeck = useCallback(() => {
                setDeck([]);
                setGlobalIdCounter(0);
            }, [deck]);

            const handleNext = useCallback(
                key => {
                    if (!inputActive) {
                        setIndex((currentIndex) =>
                            currentIndex + 1 === deck.length ? 0 : currentIndex + 1);

                    }
                },
                [setIndex, deck.length, inputActive]);


            const handlePrev = useCallback(
                key => {
                    const len = filtered ? activeCards.length - 1 : deck.length - 1;
                    if (!inputActive) {
                        setIndex(currentIndex => currentIndex - 1 < 0 ? len : currentIndex - 1);
                    }
                },
                [filtered, setIndex, deck.length, inputActive, activeCards.length]);

            const handleFlip = useCallback(
                key => {
                    if (!inputActive) {
                        setFlipped(flipped => !flipped);
                    }
                },
                [setFlipped, inputActive]);

            useEffect(() => {
                if (!filtered) {
                    const unFilteredActiveCard = deck[index];
                    if (unFilteredActiveCard) {
                        setActiveCard(unFilteredActiveCard);
                    } else {
                        setActiveCard(deck[0]);
                        setIndex(0);
                    }
                } else {
                    const filteredActiveCard = activeCards[index];
                    if (filteredActiveCard) {
                        setActiveCard(filteredActiveCard);
                    } else {
                        setActiveCard(activeCards[0]);
                        setIndex(0);
                    }
                }
            }, [filtered, index, deck, activeCards]);

            useKeyboardShortcut(nextKey, handleNext);
            useKeyboardShortcut(prevKey, handlePrev);
            useKeyboardShortcut(upKey, handleFlip);
            useKeyboardShortcut(downKey, handleFlip);
            const filterCardsClass = !showFilterMenu ?
                "filter__cards__hidden" :
                "filter__cards__show";
            const filterNotification = filtered ?
                "filter__active__notification" :
                "filter__inactive__notification";
            return /*#__PURE__*/(
                React.createElement("div", { style: { height: "100%", width: "100%", display: "block", padding: "10px" } }, /*#__PURE__*/
                    React.createElement("div", { className: filterNotification }, /*#__PURE__*/
                        React.createElement("div", { onClick: () => setFlipped(!flipped) }, /*#__PURE__*/
                            React.createElement(Card, { flipped: flipped, show: haveCards, data: activeCard })), /*#__PURE__*/

                        React.createElement("div", {className: "button-group-area" }, /*#__PURE__*/
                            React.createElement("a", {src: "#", className: "genric-btn info-border circle", onClick: () => prevCard(), style: prevStyle}, "",
                            React.createElement("i", {className: "ti ti-arrow-left"})), /*#__PURE__*/

                            React.createElement("a", {className: "genric-btn link-border circle", src: "javascript:void(0)", onClick: () => setFlipped(!flipped) },
                                flipped ? "Dịch nghĩa" : "Tiếng Anh"), /*#__PURE__*/

                                React.createElement("a", { src: "#", className: "genric-btn info-border circle", onClick: () => nextCard(), style: nextStyle }, "",
                                    React.createElement("i", { className: "ti ti-arrow-right" }))), /*#__PURE__*/

                            React.createElement("div", {
                                className: "menu__container"
                            }, /*#__PURE__*/
                                React.createElement("div", {
                                    className: "card__menu"
                                }, /*#__PURE__*/
                                    // React.createElement("button", {
                                    //         onClick: () => setShowCardForm(!showCardForm),
                                    //         style: formButtons
                                    //     },

                                    //     showCardForm ? "Hide" : "Show", " Card Input"), /*#__PURE__*/

                                    React.createElement(AddCard, {
                                        show: showCardForm,
                                        activeCard: activeCard,
                                        sendInputStatus: getChildInputStatus,
                                        sendFormData: getFormData,
                                        currentId: globalIdCounter,
                                        getNextId: sendNextId,
                                        cardsInDeck: filtered ?
                                            activeCards.length + filteredCards.length > 0 ?
                                                true :
                                                false : deck.length > 0 ?
                                                true : false,

                                        filterActive: filtered ? true : false,
                                        totalCards: filtered ? activeCards.length + filteredCards.length : deck.length
                                    })), /*#__PURE__*/



                                // React.createElement("br", null), /*#__PURE__*/
                                // React.createElement("div", {
                                //         className: "save__load"
                                //     }, /*#__PURE__*/
                                //     React.createElement("button", {
                                //             onClick: () => setShowSaveForm(!showSaveForm),
                                //             style: formButtons
                                //         },

                                //         showSaveForm ? "Hide" : "Show", " Save/Load Menu"), /*#__PURE__*/

                                //     React.createElement(SaveLoad, {
                                //         show: showSaveForm,
                                //         sendLoadData: loadCallback,
                                //         sendInputStatus: getChildInputStatus,
                                //         activeDeck: filtered ? activeCards : deck
                                //     })), /*#__PURE__*/


                                // React.createElement("br", null), /*#__PURE__*/
                                // React.createElement("div", {
                                //         className: filterCardsClass
                                //     }, /*#__PURE__*/
                                //     React.createElement("button", {
                                //             onClick: () => setShowFilterMenu(!showFilterMenu)
                                //         },
                                //         showFilterMenu ? "Hide" : "Show", " Filter Menu"), /*#__PURE__*/

                                //     React.createElement("div", null, /*#__PURE__*/
                                //         React.createElement(FilterCardsMenu, {
                                //             sendFilteredCards: getFilteredCards,
                                //             sendActiveCards: getActiveCards,
                                //             show: showFilterMenu,
                                //             sendFilterStatus: getFilterStatus,
                                //             filteredCards: filteredCards,
                                //             activeCards: activeCards,
                                //             deck: deck,
                                //             sendUpdatedDeck: getUpdatedDeck
                                //         }))), /*#__PURE__*/




                                // React.createElement("div", {
                                //         className: "shuffle__deck"
                                //     }, /*#__PURE__*/
                                //     React.createElement("button", {
                                //         className: "shuffle__deck__button",
                                //         onClick: () => {
                                //             if (window.confirm("Shuffle this deck?")) {
                                //                 shuffleDeck();
                                //             }
                                //         }
                                //     }, "Shuffle Deck"))
                            ),

                        )));



        }
        // component for displaying active card info
        const Card = props => {
            const [data, setData] = useState({ front: "sample", back: "card" });
            useEffect(
                () => {
                    setData(props.data);
                },
                [props.data]);

            const bracketStart = () => {
                return '{';
            };
            const bracketEnd = () => {
                return '}';
            };
            const footNoteStyle = { fontSize: "11px" };
            const containerStyle = { textAlign: "center", width: "100%", display: "block" };
            const stringStyle = { textAlign: "left", background: "lightgray", width: "50%", display: "inline-block" };

            const flippedClassList = props.flipped ?
                "card flip" :
                "card";
            const hiddenWhenFlipped = bool => bool ? { visibility: "visible" } : { visibility: "hidden" };
            return (
                props.show ? /*#__PURE__*/
                    React.createElement("div", { className: "container" }, /*#__PURE__*/
                        React.createElement("div", { className: flippedClassList }, /*#__PURE__*/
                           /*#__PURE__*/
                            
                            React.createElement("div", { className: props.flipped ? "front noselect collapse" : "front noselect expand" }, data ? data.front : ""), /*#__PURE__*/

                            React.createElement("div", { className: props.flipped ? "back noselect expand" : "back noselect collapse" }, data ? data.back : ""/*,
                                React.createElement("img", { src: window.location.origin + "/Assets/Client/img/voca/" + data.img, width: "200px" }, null)*/)))
                             : /*#__PURE__*/


                    React.createElement("div", { className: "container", style: { margin: "10px" } }, "Nothing to show!", /*#__PURE__*/React.createElement("br", null), " Add individual cards using the form, or upload a whole deck!", /*#__PURE__*/React.createElement("br", null), "The load feature takes a ", /*#__PURE__*/
                        React.createElement("code", null, ".json"), " file containing an array of card objects in the following format ", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/
                        React.createElement("div", { style: stringStyle }, /*#__PURE__*/React.createElement("pre", null)), /*#__PURE__*/
                        React.createElement("br", null), /*#__PURE__*/React.createElement("div", { style: footNoteStyle }, "The \"active\" property may be specified optionally for filtering purposes. The default value is true.", /*#__PURE__*/React.createElement("br", null), "NOTE: If you copy/paste the above, be sure to remove the ", /*#__PURE__*/
                            React.createElement("code", null, "'...,'"), "!")));

        };

      
        // form component for adding/editing cards
        const AddCard = props => {
            const display = props.show ? "display-block" : "display-none";
            const [editOrAdd, setEditOrAdd] = useState("add");
            const [currentId, setCurrentId] = useState(props.currentId);

            const setId = props.filterActive ?
                props.totalCards ?
                    props.totalCards :
                    0 :
                props.currentId ?
                    props.currentId :
                    0;
            const [formState, setFormState] = useState({
                front: "",
                back: "",
                active: true,
                id: setId
            });


            useEffect(() => {
                if (editOrAdd === "add") {
                    setFormState({ front: "", back: "", active: true, id: setId });
                }
            }, [setId]);
            const setEditFields = useCallback(() => {
                const card = props.activeCard ?
                    props.activeCard :
                    { front: "", back: "", active: true, id: 0 };
                setFormState({
                    front: card.front,
                    back: card.back,
                    active: card.active,
                    id: card.id
                });

            }, [props.activeCard]);
            useEffect(() => {
                if (!props.currentId) {
                    setCurrentId(setId);
                    setFormState(prev => ({ ...prev, id: setId }));
                }
            }, [props.currentId, currentId]);
            const getNextId = () => {
                return props.currentId;
            };
            useEffect(() => {
                if (editOrAdd === "add") {
                    if (props.filterActive) {
                        const tC = props.totalCards;
                        setFormState(prev => ({ ...prev, id: tC }));
                    }
                }
            }, [props.filterActive]);
            const setAddFields = useCallback(() => {
                if (props.filterActive) {
                    // const filteredIndex = props.totalCards ? props.totalCards:0;
                    setFormState({ front: "", back: "", active: true, id: setId });
                } else {
                    // const setId = props.currentId ? props.currentId:0;
                    setFormState({ front: "", back: "", active: true, id: setId });
                }
            }, [props.currentId, currentId, props.filterActive, props.totalCards, setId]);

            const handleEditOrAddChange = event => {
                const name = event.target.name;
                if (props.cardsInDeck) {
                    if (name === "edit") {
                        setEditFields();
                    } else if (name === "add") {
                        setAddFields();
                    }
                    setEditOrAdd(name);
                } else {
                    setAddFields();
                    setEditOrAdd("add");
                }
            };
            const handleInputChange = e => {
                // const name = e.target.name;
                const value = e.target.value;
                const name = e.target.name;
                setFormState(prevState => ({
                    ...prevState,
                    [name]: value
                }));

            };
            // prevents hotkey events from triggering while text inputs are active
            // otherwise, an L or R arrow key press would cause an edit to fail by changing cards mid-input
            const handleFocus = e => {
                const name = e.target.name;
                if (name === "front" || name === "back") {
                    props.sendInputStatus(true);
                } else {
                    props.sendInputStatus(false);
                }
            };
            useEffect(() => {
                if (props.activeCard && editOrAdd === "edit") {
                    setEditFields();
                } else if (!props.activeCard) {
                    setEditFields();
                } else if (editOrAdd === "add") {
                    setAddFields();
                }
            }, [editOrAdd, props.activeCard, setEditFields]);
            const handleSubmit = e => {
                //const formState.front = 'this is front';
                //const formState.back = 'this is back';
                const frontVal = formState.front.trim();
                const backVal = formState.back.trim();
                
                const op = editOrAdd;
                if (frontVal !== "" && backVal !== "" && frontVal !== backVal) {
                    // console.log("formState = "+formState["front"]+", "+formState.back);
                    const options = { operation: op, data: formState };
                    // if (
                    //   options.data.front.trim() !== "" &&
                    //   options.data.back.trim() !== "" &&
                    //   options.data.front !== options.data.back
                    // ) {
                    // console.log("options from handleSubmit = " + JSON.stringify(options))
                    e.preventDefault();
                    props.sendFormData(options);
                    if (op === "add") {
                        props.getNextId();
                        setAddFields();
                    }
                } else {
                    e.preventDefault();
                    alert("pls add a real card");
                }
            };
            const checkValue = editOrAdd === "edit" ? [true, false] : [false, true];
            const buttonVal = editOrAdd.charAt(0).toUpperCase() + editOrAdd.slice(1);
            const allowEdit = props.cardsInDeck ? "" : "noselect";
            const allowEditStyle = props.cardsInDeck ?
                { color: "black" } :
                { color: "lightgray", fontStyle: "italic", textDecoration: "line-through" };
            return /*#__PURE__*/(
                React.createElement("div", { className: display }, /*#__PURE__*/
                    React.createElement("form", null,
                        " ", /*#__PURE__*/
                        //React.createElement("div", { style: allowEditStyle, className: allowEdit }, /*#__PURE__*/
                        //    React.createElement("input", {
                        //        type: "radio",
                        //        name: "edit",
                        //        checked: checkValue[0],
                        //        onChange: handleEditOrAddChange
                        //    }), /*#__PURE__*/

                        //React.createElement("label", { htmlFor: "edit" }, "Edit")), /*#__PURE__*/

                        //React.createElement("input", {
                        //    type: "radio",
                        //    name: "add",
                        //    checked: checkValue[1],
                        //    onChange: handleEditOrAddChange
                        //}), /*#__PURE__*/

                        //React.createElement("label", { htmlFor: "add" }, "Add"), /*#__PURE__*/
                        //React.createElement("br", null), /*#__PURE__*/
                        //React.createElement("input", {
                        //    type: "text",
                        //    name: "front",
                        //    placeholder: "flashcard front",
                        //    value: formState.front,
                        //    onChange: handleInputChange,
                        //    onFocus: handleFocus,
                        //    onBlur: () => props.sendInputStatus(false),
                        //    autoComplete: "off"
                        //}), /*#__PURE__*/

                        //React.createElement("br", null), /*#__PURE__*/
                        //React.createElement("input", {
                        //    type: "text",
                        //    name: "back",
                        //    placeholder: "flashcard back",
                        //    value: formState.back,
                        //    onChange: handleInputChange,
                        //    onFocus: handleFocus,
                        //    onBlur: () => props.sendInputStatus(false),
                        //    autoComplete: "off"
                        //}), /*#__PURE__*/

                        //React.createElement("br", null), /*#__PURE__*/
                        //React.createElement("div", { className: "form__id" },
                        //    buttonVal, "ing id: ", formState.id), /*#__PURE__*/

                        //React.createElement("input", { type: "button", value: buttonVal, id: "btnAdd", onClick: handleSubmit })
                    )));



        };
        
        const blacklistedTargets = ["INPUT", "TEXTAREA"];
        //reducer for our custom hotkeys hook
        const keysReducer = (state, action) => {
            switch (action.type) {
                case "set-key-down":
                    return { ...state, [action.key]: true };
                case "set-key-up":
                    return { ...state, [action.key]: false };
                default:
                    return state;
            }

        };

        // custom hook for Keyboard shortcuts/hotkeys
        const useKeyboardShortcut = (shortcutKeys, callback) => {
            if (!Array.isArray(shortcutKeys))
                throw new Error(
                    "The first parameter to `useKeyboardShortcut` must be an ordered array of `KeyboardEvent.key` strings.");


            if (!shortcutKeys.length)
                throw new Error(
                    "The first parameter to `useKeyboardShortcut` must contain atleast one `KeyboardEvent.key` string.");


            if (!callback || typeof callback !== "function")
                throw new Error(
                    "The second parameter to `useKeyboardShortcut` must be a function that will be envoked when the keys are pressed.");


            const initalKeyMapping = shortcutKeys.reduce((currentKeys, key) => {
                currentKeys[key.toLowerCase()] = false;
                return currentKeys;
            }, {});

            const [keys, setKeys] = useReducer(keysReducer, initalKeyMapping);

            const keydownListener = useCallback(
                keydownEvent => {
                    const { key, target, repeat } = keydownEvent;
                    const loweredKey = key.toLowerCase();

                    if (repeat) return;
                    if (blacklistedTargets.includes(target.tagName)) return;
                    if (keys[loweredKey] === undefined) return;

                    if (keys[loweredKey] === false)
                        setKeys({ type: "set-key-down", key: loweredKey });
                },
                [keys]);


            const keyupListener = useCallback(
                keyupEvent => {
                    const { key, target } = keyupEvent;
                    const loweredKey = key.toLowerCase();

                    if (blacklistedTargets.includes(target.tagName)) return;
                    if (keys[loweredKey] === undefined) return;

                    if (keys[loweredKey] === true)
                        setKeys({ type: "set-key-up", key: loweredKey });
                },
                [keys]);


            useEffect(() => {
                if (!Object.values(keys).filter(value => !value).length) callback(keys);
            }, [callback, keys]);

            useEffect(() => {
                window.addEventListener("keydown", keydownListener, true);
                return () => window.removeEventListener("keydown", keydownListener, true);
            }, [keydownListener]);

            useEffect(() => {
                window.addEventListener("keyup", keyupListener, true);
                return () => window.removeEventListener("keyup", keyupListener, true);
            }, [keyupListener]);
        };

        const nextStyle = {
            marginRight: "5px",
            display: "inline",
            float: "right"
        };

        const prevStyle = {
            marginLeft: "5px",
            display: "inline",
            float: "left"
        };

        const flipStyle = {
            display: "inline",
            marginLeft: "-1.75rem"
        };

        const divStyle = {
            width: "auto",
            textAlign: "center"
        };

        const formButtons = {
            margin: "0px"
        };


//var sampleDeck = [
//    { front: 'Cow', back: "Con bò", img: '3556879530_089814192c.jpg' },
//    { front: "Tiger", back: "Con hổ", img: '3556879530_089814192c.jpg' },
//    { front: "Lion", back: "Con sư tử", img: '3556879530_089814192c.jpg' },
//    { front: "Monkey", back: "Con khỉ", img: '3556879530_089814192c.jpg' }
//];

        var tId = 0;
        var mappedDeck = sampleDeck.map(obj => {
            let newObj = {};
            for (let key in obj) {
                newObj[key] = obj[key];
            }
            newObj.active = true;
            newObj.id = tId;
            tId++;
            console.log(newObj);
            return newObj;
        });

        function toggleInfoDisplay() {
            const menu = document.getElementsByClassName("info__menu")[0];
            menu.classList.toggle("display-none");
            menu.classList.toggle("display-block");
        }

        const root = document.createElement("div");
        // const root = document.createElement("div");
        root.id = "root";
        document.body.appendChild(root);
        const rootHandle = document.getElementById("root");
        ReactDOM.render( /*#__PURE__*/React.createElement(App, null), document.getElementById("root"));
