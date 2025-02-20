"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var react_2 = require("@chakra-ui/react");
var react_router_dom_1 = require("react-router-dom");
var firestore_1 = require("firebase/firestore");
var firebase_1 = require("../config/firebase");
var md_1 = require("react-icons/md");
var framer_motion_1 = require("framer-motion");
var ChakraIcon_1 = require("../components/ChakraIcon");
var hi_1 = require("react-icons/hi");
var MotionBox = framer_motion_1.motion(react_2.Box);
var typeColors = {
    letter: 'pink',
    card: 'purple',
    note: 'blue',
    poem: 'green',
    story: 'orange'
};
function ViewConfession() {
    var _this = this;
    var id = react_router_dom_1.useParams().id;
    var _a = react_1.useState(null), confession = _a[0], setConfession = _a[1];
    var _b = react_1.useState(true), loading = _b[0], setLoading = _b[1];
    var _c = react_1.useState(''), pin = _c[0], setPin = _c[1];
    var _d = react_1.useState(false), isUnlocked = _d[0], setIsUnlocked = _d[1];
    var _e = react_1.useState(false), isPinModalOpen = _e[0], setIsPinModalOpen = _e[1];
    var _f = react_1.useState(0), pinAttempts = _f[0], setPinAttempts = _f[1];
    var toast = react_2.useToast();
    var navigate = react_router_dom_1.useNavigate();
    var bgColor = react_2.useColorModeValue('white', 'gray.800');
    var borderColor = react_2.useColorModeValue('gray.200', 'gray.600');
    react_1.useEffect(function () {
        function fetchConfession() {
            return __awaiter(this, void 0, void 0, function () {
                var docRef, docSnap, data, pin_1, storedPin, storedPinValue, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!id)
                                return [2 /*return*/];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 6, 7, 8]);
                            docRef = firestore_1.doc(firebase_1.db, 'confessions', id);
                            return [4 /*yield*/, firestore_1.getDoc(docRef)];
                        case 2:
                            docSnap = _a.sent();
                            if (!docSnap.exists()) return [3 /*break*/, 4];
                            data = docSnap.data();
                            pin_1 = typeof data.pin === 'string' ?
                                parseInt(data.pin, 10) :
                                typeof data.pin === 'number' ?
                                    data.pin :
                                    0;
                            setConfession(__assign(__assign({ id: docSnap.id }, data), { pin: pin_1, isHidden: data.isHidden || false }));
                            storedPin = localStorage.getItem("confession_pin_" + docSnap.id);
                            if (storedPin) {
                                storedPinValue = typeof storedPin === 'string' ?
                                    parseInt(storedPin, 10) : storedPin;
                                if (storedPinValue === pin_1) {
                                    setIsUnlocked(true);
                                    setIsPinModalOpen(false);
                                }
                                else {
                                    setIsPinModalOpen(true);
                                }
                            }
                            else {
                                setIsPinModalOpen(true);
                            }
                            // Increment view count
                            return [4 /*yield*/, firestore_1.updateDoc(docRef, {
                                    views: firestore_1.increment(1)
                                })];
                        case 3:
                            // Increment view count
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            toast({
                                title: "Confession not found",
                                status: "error",
                                duration: 3000
                            });
                            navigate('/');
                            _a.label = 5;
                        case 5: return [3 /*break*/, 8];
                        case 6:
                            error_1 = _a.sent();
                            console.error('Error fetching confession:', error_1);
                            toast({
                                title: "Error fetching confession",
                                status: "error",
                                duration: 3000
                            });
                            return [3 /*break*/, 8];
                        case 7:
                            setLoading(false);
                            return [7 /*endfinally*/];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        }
        fetchConfession();
    }, [id, navigate, toast]);
    var handlePinSubmit = function () {
        if (!confession)
            return;
        var enteredPin = parseInt(pin, 10);
        var storedPin = typeof confession.pin === 'string' ?
            parseInt(confession.pin, 10) : confession.pin;
        if (enteredPin === storedPin) {
            setIsUnlocked(true);
            setIsPinModalOpen(false);
            // Store PIN for future auto-unlock
            localStorage.setItem("confession_pin_" + confession.id, pin);
        }
        else {
            setPinAttempts(function (prev) { return prev + 1; });
            toast({
                title: "Incorrect PIN",
                status: "error",
                duration: 2000
            });
            setPin('');
        }
    };
    var handleModalClose = function () {
        if (!isUnlocked) {
            navigate('/');
        }
        setIsPinModalOpen(false);
    };
    var handleShare = function () {
        var url = window.location.href;
        navigator.clipboard.writeText(url);
        toast({
            title: "Link copied!",
            status: "success",
            duration: 2000
        });
    };
    var handleHideToggle = function () { return __awaiter(_this, void 0, void 0, function () {
        var docRef, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confession)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    docRef = firestore_1.doc(firebase_1.db, 'confessions', confession.id);
                    return [4 /*yield*/, firestore_1.updateDoc(docRef, {
                            isHidden: !confession.isHidden
                        })];
                case 2:
                    _a.sent();
                    toast({
                        title: "Confession " + (confession.isHidden ? 'unhidden' : 'hidden'),
                        status: 'success',
                        duration: 3000
                    });
                    // Update local state
                    setConfession(function (prev) { return prev ? __assign(__assign({}, prev), { isHidden: !prev.isHidden }) : null; });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error toggling confession visibility:', error_2);
                    toast({
                        title: 'Error updating confession',
                        status: 'error',
                        duration: 3000
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (react_1["default"].createElement(react_2.Box, { minH: "100vh", bg: "gray.50" },
        react_1["default"].createElement(react_2.Container, { maxW: { base: "100%", md: "90%", lg: "80%" }, p: { base: 2, md: 4 } }, loading ? (react_1["default"].createElement(react_2.Center, { h: "50vh" },
            react_1["default"].createElement(react_2.Spinner, { size: "xl", color: "blue.500" }))) : !confession ? (react_1["default"].createElement(react_2.Alert, { status: "error", rounded: "lg" },
            react_1["default"].createElement(react_2.AlertIcon, null),
            "Confession not found")) : (react_1["default"].createElement(react_2.VStack, { spacing: { base: 3, md: 6 }, align: "stretch" },
            react_1["default"].createElement(react_2.HStack, { justify: "space-between", wrap: "wrap", gap: 2, position: "sticky", top: 0, bg: "gray.50", p: 2, zIndex: 1, boxShadow: "sm" },
                react_1["default"].createElement(react_2.Button, { leftIcon: react_1["default"].createElement(ChakraIcon_1.ChakraIcon, { icon: md_1.MdArrowBack }), onClick: function () { return navigate(-1); }, size: { base: "sm", md: "md" }, variant: "ghost", rounded: "full" }, "Back"),
                react_1["default"].createElement(react_2.Text, { fontSize: { base: "xs", md: "sm" }, color: "gray.600" }, new Date(confession.createdAt).toLocaleDateString()),
                react_1["default"].createElement(react_2.Menu, null,
                    react_1["default"].createElement(react_2.MenuButton, { as: react_2.IconButton, icon: react_1["default"].createElement(ChakraIcon_1.ChakraIcon, { icon: hi_1.HiDotsVertical }) }),
                    react_1["default"].createElement(react_2.MenuList, null,
                        react_1["default"].createElement(react_2.MenuItem, { onClick: handleHideToggle }, confession.isHidden ? 'Unhide' : 'Hide')))),
            react_1["default"].createElement(react_2.Box, __assign({ p: { base: 4, md: 6 }, borderRadius: "xl", bg: "white", boxShadow: "sm" }, getThemeStyles(confession.type)),
                react_1["default"].createElement(react_2.VStack, { spacing: 4, align: "stretch" },
                    react_1["default"].createElement(react_2.Badge, { alignSelf: "flex-start", variant: "subtle", colorScheme: getThemeColor(confession.type), rounded: "full", px: 3, py: 1, fontSize: { base: "xs", md: "sm" } }, confession.type),
                    react_1["default"].createElement(react_2.Text, { fontSize: { base: "lg", md: "xl", lg: "2xl" }, fontWeight: "medium", lineHeight: "tall", whiteSpace: "pre-wrap" }, isUnlocked ? (react_1["default"].createElement(react_2.Text, { whiteSpace: "pre-wrap" }, confession.content)) : (react_1["default"].createElement(react_2.Text, { css: {
                            filter: 'blur(4px)'
                        } }, confession.content))),
                    react_1["default"].createElement(react_2.HStack, { justify: "space-between", mt: 2 },
                        react_1["default"].createElement(react_2.Text, { fontSize: { base: "xs", md: "sm" }, color: "gray.500" },
                            confession.views,
                            " views")))),
            react_1["default"].createElement(react_2.Modal, { isOpen: isPinModalOpen, onClose: handleModalClose, closeOnOverlayClick: false },
                react_1["default"].createElement(react_2.ModalOverlay, null),
                react_1["default"].createElement(react_2.ModalContent, null,
                    react_1["default"].createElement(react_2.ModalHeader, null, "Enter PIN to unlock"),
                    react_1["default"].createElement(react_2.ModalCloseButton, null),
                    react_1["default"].createElement(react_2.ModalBody, { pb: 6 },
                        react_1["default"].createElement(react_2.VStack, { spacing: 4 },
                            react_1["default"].createElement(react_2.Text, null, "Please enter the 4-digit PIN to view this confession"),
                            react_1["default"].createElement(react_2.HStack, { justify: "center" },
                                react_1["default"].createElement(react_2.PinInput, { value: pin, onChange: setPin, onComplete: handlePinSubmit, type: "number", mask: true, otp: true, size: { base: "lg", md: "xl" } },
                                    react_1["default"].createElement(react_2.PinInputField, null),
                                    react_1["default"].createElement(react_2.PinInputField, null),
                                    react_1["default"].createElement(react_2.PinInputField, null),
                                    react_1["default"].createElement(react_2.PinInputField, null))),
                            react_1["default"].createElement(react_2.Button, { colorScheme: "pink", onClick: handlePinSubmit, isDisabled: pin.length !== 4 }, "Unlock"))))))))));
}
exports["default"] = ViewConfession;
function getThemeStyles(type) {
    switch (type) {
        case 'letter':
            return {
                bg: 'pink.100',
                borderColor: 'pink.200'
            };
        case 'card':
            return {
                bg: 'purple.100',
                borderColor: 'purple.200'
            };
        case 'note':
            return {
                bg: 'blue.100',
                borderColor: 'blue.200'
            };
        case 'poem':
            return {
                bg: 'green.100',
                borderColor: 'green.200'
            };
        case 'story':
            return {
                bg: 'orange.100',
                borderColor: 'orange.200'
            };
        default:
            return {};
    }
}
function getThemeColor(type) {
    switch (type) {
        case 'letter':
            return 'pink';
        case 'card':
            return 'purple';
        case 'note':
            return 'blue';
        case 'poem':
            return 'green';
        case 'story':
            return 'orange';
        default:
            return 'gray';
    }
}
