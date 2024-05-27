import { useState, useEffect, useCallback, useContext } from "react";
import { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

import { VotingContext } from "../context/Voter";
import Style from "../styles/allowedVoter.module.css";
import images from "../assets";
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";

const allowedVoters = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({
    name: "",
    address: "",
    position: "",
  });

  const router = useRouter();

  const { uploadToIPFS, createVoter, getNewCandidate, voterArray } =
    useContext(VotingContext);

  console.log(voterArray);

  //-------------VOTERS
  const onDrop = useCallback(async (acceptedFile) => {
    const url = await uploadToIPFS(acceptedFile[0]);

    setFileUrl(url);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*",
    maxSize: 5000000,
  });

  useEffect(() => {
    getNewCandidate();
    console.log(voterArray);
  }, []);

  return (
    <div className={Style.createVoter}>
      <div>
        {fileUrl && (
          <div className={Style.voterInfo}>
            <img src={fileUrl} alt="asset_file" />
            <div className={Style.voterInfo_paragraph}>
              <p>
                İsim: <span>&nbsp;{formInput.name}</span>{" "}
              </p>
              <p>
                Ekle:&nbsp; <span>{formInput.address.slice(0, 20)} </span>
              </p>
              <p>
                Sıra:&nbsp;<span>{formInput.position}</span>
              </p>
            </div>
          </div>
        )}

        {!fileUrl && (
          <div className={Style.sideInfo}>
            <div className={Style.sideInfo_box}>
              <h4>Seçmen Oluştur</h4>
              <p>
                Blockchain tabanlı oylama sistemi
              </p>
              <p className={Style.sideInfo_para}>Kontrat Aday Listesi</p>
            </div>
            <div className={Style.car}>
              {voterArray.map((el, i) => (
                <div key={i + 1} className={Style.card_box}>
                  <div className={Style.image}>
                    <img src={el[4]} alt="Profile photo" />
                  </div>

                  <div className={Style.card_info}>
                    <p>
                      {el[1]} #{el[1].toNumber()}
                    </p>
                    <p>{el[0]}</p>
                    <p>Address: {el[3].slice(0, 10)}..</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={Style.voter}>
        <div className={Style.voter__container}>
          <h1>Yeni seçmen kayıt</h1>
          <div className={Style.voter__container__box}>
            <div className={Style.voter__container__box__div}>
              <div {...getRootProps()}>
                <input {...getInputProps()} />

                <div className={Style.voter__container__box__div_info}>
                  <p>Resim yükle: JPG, PNG, GIF, WEBM MAX 100MB</p>

                  <div className={Style.voter__container__box__div__image}>
                    <Image
                      src={images.upload}
                      width={150}
                      height={150}
                      objectFit="contain"
                      alt="file upload"
                    />
                  </div>

                  <p>Resim sürükle ya da seç</p>
                  <p>Ya da cihazınızdan resim ekleyin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={Style.input__container}>
          <Input
            inputType="text"
            title="İsim"
            placeholder="Seçmen İsmi"
            handleClick={(e) =>
              setFormInput({ ...formInput, name: e.target.value })
            }
          />
          <Input
            inputType="text"
            title="Address"
            placeholder="Seçmen Adresi"
            handleClick={(e) =>
              setFormInput({ ...formInput, address: e.target.value })
            }
          />
          <Input
            inputType="text"
            title="Numara"
            placeholder="Seçmen Numarası"
            handleClick={(e) =>
              setFormInput({ ...formInput, position: e.target.value })
            }
          />

          <div className={Style.Button}>
            <Button
              btnName="Seçmen Yetkilendir."
              handleClick={() => createVoter(formInput, fileUrl, router)}
            />
          </div>
        </div>
      </div>

      <div className={Style.createdVorter}>
        <div className={Style.createdVorter__info}>
          <Image src={images.creator} alt="user profile" />
          <p>Not</p>
          <p>
            Yönetici <span>0xd0fc6286aF7E..</span>
          </p>
          <p>
            Sadece kurucu kontrat adresi seçmen ve aday kaydı oluşturabilir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default allowedVoters;
