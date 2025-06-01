// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract FhirVerifier {
    // Scalar field size
    uint256 constant r = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax = 9503597627762149675618835580506743393004755448702171453743999941364545564451;
    uint256 constant alphay = 14876316312841362809659688872604926819434271873296656743392225574571926653116;
    uint256 constant betax1 = 4732734543476130736228219680186370144819799108987083961858040646109124886971;
    uint256 constant betax2 = 144891219485223966420156747371977201501112187786311588155879748008375679805;
    uint256 constant betay1 = 19949885506296760321742161809289615746605898935929281495994744606381172286878;
    uint256 constant betay2 = 17038194252835601842891970855929810679803128656192229758267662445078395689351;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant deltax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant deltay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant deltay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;

    uint256 constant IC0x = 785795620489890896290319178323260754366213835883566672456018761437678992721;
    uint256 constant IC0y = 20514848731937070943587200407863416143424830170099628640812316599099261388535;

    uint256 constant IC1x = 21319917593616675769490333641523700397637955346688593106110629860449351618634;
    uint256 constant IC1y = 7551847413391038864055382066548347173001992310168487542091549822864041597312;

    uint256 constant IC2x = 11635039468559645312767403603883167447465393133161044755199856293092776377398;
    uint256 constant IC2y = 16321073544131628502870739043483594863007619719965329009321273050206319954237;

    uint256 constant IC3x = 11871688543992961554019984668196505421292109566229233680140839665852190329087;
    uint256 constant IC3y = 112636220882119413617097398664105413820688737576137316059034541029191913255;

    uint256 constant IC4x = 12777432678450058678830754202847187341950517977043578118051233761215282006157;
    uint256 constant IC4y = 20947417085743886516699254685195907714138467521184350063379350604570203511521;

    uint256 constant IC5x = 3036166549655434327922057871901979685316063474702543355136646231976019716991;
    uint256 constant IC5y = 21535428011841507624326829019482496499124912676539794458269561670347470729385;

    uint256 constant IC6x = 10229538288210451136199613359525347361799965245563869359359415060563641018252;
    uint256 constant IC6y = 14597076174693381314143925898563803651669521542908693626313594242964864022691;

    uint256 constant IC7x = 1800111806630872348227760445571279706811060398331316919027455889989978895611;
    uint256 constant IC7y = 4377384060069578771310443681491921563584928288281725335925196672172263827293;

    uint256 constant IC8x = 7586114950395530550986627938185141061934960586372731101725536846435461095168;
    uint256 constant IC8y = 20937018035824905101574792479075231773712191029157678539722911252971074156444;

    uint256 constant IC9x = 20246664831149793558443101632480169801117982901469667784669844883589503011331;
    uint256 constant IC9y = 4569117176491207724046515500699809545142606359801273633827949943208397089773;

    uint256 constant IC10x = 12653097629316174845028871231258500641078489528949747680694958626639345297791;
    uint256 constant IC10y = 21863132808321074474512630620004881123381121329138860953254677770473528967270;

    uint256 constant IC11x = 6100546352246948616634313243195899688397268754378383884409689711552200753267;
    uint256 constant IC11y = 8735503097367575223717988040717852055369524114833196086247697530223657816924;

    uint256 constant IC12x = 12749707821295272767953806846614959835771677740625054630584237799000933436303;
    uint256 constant IC12y = 2475583085138348893259106310009926399426816130255012437252666807659206850273;

    uint256 constant IC13x = 990036114095935829586052129596901013019508250467868500207137622369494618860;
    uint256 constant IC13y = 18359273436422016338540529431248706554363025793266122463643440152144937856638;

    uint256 constant IC14x = 3810086384265386247473033681009055042137365117396377450883679019097124896017;
    uint256 constant IC14y = 8289105920756773403831004819665450958076243260728686609170563409977512965073;

    uint256 constant IC15x = 10627717092014484341182748926879118584656672654838162717746424622288785414673;
    uint256 constant IC15y = 7167087580428289226256128543776329122861278910638335841145038015951986410907;

    uint256 constant IC16x = 20876138808637369754605751734598154798144498327247912912886770862734738144854;
    uint256 constant IC16y = 2413260048419148061175889193105871803584027071095681905376897322204946769543;

    uint256 constant IC17x = 14574915605898468999341909161651212372448031687317721197056904629813200731994;
    uint256 constant IC17y = 13500587090872056835464159297712023880738832322150845182934634244735860076744;

    uint256 constant IC18x = 12219216434726298779882453791025394575399304213689135878234204208981371423203;
    uint256 constant IC18y = 14185074379909402240298896346509766016436455431936319804687993386854636721335;

    uint256 constant IC19x = 16874407625294341166098958812442957297626889942386860088021337837050006887260;
    uint256 constant IC19y = 17694612500568218667033796023127457591789782720229788718635632498495145654358;

    uint256 constant IC20x = 2869551390225195718537349833488316066881743767463820293648439901116735970166;
    uint256 constant IC20y = 17859056067679676628813671906838999897625572248314411721242330216046319428602;

    uint256 constant IC21x = 3138043639884604424266872246864199095284062503876056163879679476575666625012;
    uint256 constant IC21y = 20946701322494473628158091254647308388056107648539828104086179843962678239571;

    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[21] calldata _pubSignals
    ) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x

                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))

                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))

                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))

                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))

                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))

                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))

                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))

                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))

                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))

                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))

                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))

                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))

                g1_mulAccC(_pVk, IC13x, IC13y, calldataload(add(pubSignals, 384)))

                g1_mulAccC(_pVk, IC14x, IC14y, calldataload(add(pubSignals, 416)))

                g1_mulAccC(_pVk, IC15x, IC15y, calldataload(add(pubSignals, 448)))

                g1_mulAccC(_pVk, IC16x, IC16y, calldataload(add(pubSignals, 480)))

                g1_mulAccC(_pVk, IC17x, IC17y, calldataload(add(pubSignals, 512)))

                g1_mulAccC(_pVk, IC18x, IC18y, calldataload(add(pubSignals, 544)))

                g1_mulAccC(_pVk, IC19x, IC19y, calldataload(add(pubSignals, 576)))

                g1_mulAccC(_pVk, IC20x, IC20y, calldataload(add(pubSignals, 608)))

                g1_mulAccC(_pVk, IC21x, IC21y, calldataload(add(pubSignals, 640)))

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))

                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)

                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F

            checkField(calldataload(add(_pubSignals, 0)))

            checkField(calldataload(add(_pubSignals, 32)))

            checkField(calldataload(add(_pubSignals, 64)))

            checkField(calldataload(add(_pubSignals, 96)))

            checkField(calldataload(add(_pubSignals, 128)))

            checkField(calldataload(add(_pubSignals, 160)))

            checkField(calldataload(add(_pubSignals, 192)))

            checkField(calldataload(add(_pubSignals, 224)))

            checkField(calldataload(add(_pubSignals, 256)))

            checkField(calldataload(add(_pubSignals, 288)))

            checkField(calldataload(add(_pubSignals, 320)))

            checkField(calldataload(add(_pubSignals, 352)))

            checkField(calldataload(add(_pubSignals, 384)))

            checkField(calldataload(add(_pubSignals, 416)))

            checkField(calldataload(add(_pubSignals, 448)))

            checkField(calldataload(add(_pubSignals, 480)))

            checkField(calldataload(add(_pubSignals, 512)))

            checkField(calldataload(add(_pubSignals, 544)))

            checkField(calldataload(add(_pubSignals, 576)))

            checkField(calldataload(add(_pubSignals, 608)))

            checkField(calldataload(add(_pubSignals, 640)))

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
            return(0, 0x20)
        }
    }
}
