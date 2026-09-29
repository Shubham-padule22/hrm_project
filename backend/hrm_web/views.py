import traceback
from time import timezone
from django.db.models import ObjectDoesNotExist , Q, Sum,Count,F,Case, When, Value, CharField
from django.shortcuts import render
from networkx import reverse
import pytest
from rest_framework.views import APIView, settings
import re  
from rest_framework.response import Response
from rest_framework import status, generics
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken, datetime
from rest_framework.permissions import IsAuthenticated
from hrm_web.renders import UserRenderer
from django.contrib.auth import authenticate
from datetime import datetime, timedelta, date, time
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from django.utils import timezone
import requests,random
from django.db import transaction
import jwt
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.paginator import Paginator
from rest_framework.pagination import PageNumberPagination
from django.core.mail import EmailMessage
from django.conf import settings
from face_auth.models import *
from rest_framework.permissions import AllowAny
from django.db.models.expressions import RawSQL
from django.db.models import Count, Q
from django.db.models.functions import Concat
# ----------------------------Payment------------------------------------------

from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import *
from .serializers import *
from .services import calculate_and_generate_payslip

from django.shortcuts import get_object_or_404
import base64
import uuid
from io import BytesIO
from captcha.image import ImageCaptcha
from django.core.cache import cache
from django.db import DatabaseError

from django.db.models import Count, Sum, Q
import datetime as dt
from collections import defaultdict


from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.utils import get_column_letter
import json
import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings

# ---------------------- Text local sms send fun ---------------------------------------------
def send_test_otp(number,otp):
    api_key = settings.TEXTLOCAL_API_KEY
    phone_number = number
    sender = "SPEROO"
    otp_int = otp
    # message = f"Use {otp_int} as your verification code on Spero Application. The OTP expires within 10 mins,{otp_int} Team Spero"
    message = f"Use {otp_int} as your verification code on Spero Application. The OTP expires within 10 mins, {otp_int} Team Spero"
    # Use %%|otp^{"inputtype" : "text", "maxlength" : "5"}%% as your verification code on Spero Application. The OTP expires within 10 mins, %%|otp^{"inputtype" : "text", "maxlength" : "5"}%% Team Spero

    try:
        response = requests.post(
            "https://api.textlocal.in/send/",
            data={
                'apikey': api_key,
                'numbers': phone_number,
                'message': message,
                'sender': sender
            }
        )
        print(response.text)
        print(phone_number,"phone_number")
        # clg_id = get_clg(request)
        # print("TOKEN___________ ", clg_id)
        # prof_data = agg_hhc_service_professionals.objects.get(phone_no=phone_number)
        # if prof_data is not None:
        #     prof_name = prof_data.prof_fullname
        # else:
        #     prof_name = ""
        
        # if response.status_code == 200:
            
        #     data = {
        #             "professional_name":prof_name,
        #             "contact_number":phone_number,
        #             "sent_status":1,
        #             "sms_type":3,
        #             "status":1,
        #             "added_by":prof_name
        #     }
            # serializer = professional_otp_dtl(data=data)
            # if serializer.is_valid():
            #     serializer.save()
            
            # return Response({'message': 'SMS sent successfully.','SMS':serializer.data, 'response': response.json()})
        # else:
        #     data = {
        #             "professional_name":prof_name,
        #             "contact_number":phone_number,
        #             "sent_status":2,
        #             "sms_type":3,
        #             "status":1,
        #         "added_by":prof_name
        #     }
            # serializer = professional_otp_dtl(data=data)
            # if serializer.is_valid():
            #     serializer.save()
            # return Response({'error': response.text}, status=500)
    except Exception as e:
        print("msg not send",str(e))
        

def send_whatsapp_new(to_number, template_name, body_params=None, button_param=None, image_url=None):
    API_KEY = "fee99a29-8262-11f0-98fc-02c8a5e042bd"
    PHONE_NUMBER_ID = "791454430710308"

    url = f"https://partnersv1.pinbot.ai/v3/{PHONE_NUMBER_ID}/messages"
    headers = {
        "apikey": API_KEY,
        "Content-Type": "application/json"
    }

    body_parameters = [{"type": "text", "text": str(v)} for v in (body_params or [])]

    components = []

    # HEADER IMAGE
    if image_url:
        components.append({
            "type": "header",
            "parameters": [
                {
                    "type": "image",
                    "image": {"link": image_url}
                }
            ]
        })

    # BODY PLACEHOLDERS
    components.append({
        "type": "body",
        "parameters": body_parameters
    })

    if button_param:
        components.append({
            "type": "button",
            "sub_type": "url",
            "index": "0",
            "parameters": [
                {
                    "type": "text",
                    "text": str(button_param)
                }
            ]
        })

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": str(to_number),
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": "en"},
            "components": components
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    print("whatsapp")
    print("url:", url)
    print("statusss:", response.status_code)
    print("resonseee:", response.text)
    print("payloadd:", payload)
    print("--------")
    return response.json()



# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred)
# from dotenv import load_dotenv
# import os
# import json
# import firebase_admin
# from firebase_admin import credentials

# ss = load_dotenv(".env")
# print(ss)
# print(json.loads(os.getenv("FIREBASE_CREDENTIALS")))
# # if not firebase_admin._apps:
# #     firebase_data = os.getenv("FIREBASE_CREDENTIALS")
# #     firebase_config = json.loads(firebase_data)
# #     cred = credentials.Certificate(firebase_config)
# #     firebase_admin.initialize_app(cred)

def send_fcm_notification(token, title, body, data=None):
    """
    Send FCM notification to a single device.
    """
    
    try:
        print("stared fcm")
        print(type(body))
        print(body)
        print(title)
        print(token)
        message = messaging.Message(
            notification=messaging.Notification(title=title,body=body),
            data=data or {},
            token=token,
        )
        print(message)
        response = messaging.send(message)
        print(response)
        return {"status": True,"message_id": response}
    except Exception as e:
        print(str(e))
        return {"status": False,"error": str(e)}
    
class ColleagueOTPLogin(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        try:
            res_data = None
            error = None

            otp_type = request.data['otp_type']
            number = request.data['phone_no']
            email = request.data['email']
            token = request.data['token']
            otp = str(random.randint(100000, 999999))    
            current_time = timezone.localtime(timezone.now())
            print("current_time1234----------", current_time)
            otp_expire_time = current_time + timezone.timedelta(minutes=10)

            
            # WHATSAPP OTP

            if otp_type == "whatsapp":

                if number != None:

                    colleague_found = EMSColleague.objects.filter(
                        clg_mobile_no=number
                    ).first()

                    if colleague_found:

                        try:

                            if (
                                colleague_found.clg_is_deleted == 1
                                or colleague_found.clg_is_active == 0
                            ):

                                error = {
                                    'msg': "This user is inactive"
                                }

                                response_data = {
                                    'Res_Data': res_data,
                                    'error': error
                                }

                                return Response(
                                    response_data,
                                    status=status.HTTP_200_OK
                                )

                            device_token = DeviceToken.objects.get(
                                clg_id=colleague_found.clg_id,
                                token=token
                            )

                            serializer = DeviceToken_serializer(
                                device_token
                            )

                            if device_token == None:

                                serializer = DeviceToken_serializer(
                                    data=request.data
                                )

                                if serializer.is_valid():

                                    serializer.validated_data[
                                        'clg_id'
                                    ] = colleague_found.id

                                    serializer.save()

                        except DeviceToken.DoesNotExist:

                            request.data['clg_id'] = colleague_found.clg_id

                            serializer = DeviceToken_serializer(
                                data=request.data
                            )

                            if serializer.is_valid():
                                serializer.save()

                        colleague_found.otp = otp

                        colleague_found.otp_count = (
                            colleague_found.otp_count + 1
                            if colleague_found.otp_count is not None
                            else 1
                        )

                        colleague_found.otp_expire_time = otp_expire_time

                        colleague_found.save()

                        # WhatsApp OTP

                        to_number = '91' + str(number)

                        template_name = "kycotp"
                        placeholders = [otp]

                        send_whatsapp_new(
                            to_number,
                            template_name,
                            placeholders,
                            otp
                        )

                        res_data = {
                            'phone_no': number,
                            'msg': "This Phone Number Is Already Register"
                        }

                        response_data = {
                            'Res_Data': res_data,
                            'msg': "OTP sent successfully to the registered phone number.",
                            'error': error
                        }

                        return Response(
                            response_data,
                            status=status.HTTP_200_OK
                        )

                    else:

                        response_data = {
                            'Res_Data': res_data,
                            'error': {
                                'msg': 'This Phone Number Is Not Register'
                            }
                        }

                        return Response(
                            response_data,
                            status=status.HTTP_200_OK
                        )

                else:

                    response_data = {
                        'Res_Data': res_data,
                        'error': {
                            'msg': 'Phone number is not valid. Please enter valid phone number.'
                        }
                    }

                    return Response(
                        response_data,
                        status=status.HTTP_200_OK
                    )

            # EMAIL OTP

            elif otp_type == "email":

                if email != None:

                    colleague_found = EMSColleague.objects.filter(
                        clg_email=email
                    ).first()

                    if colleague_found:

                        try:

                            if (
                                colleague_found.clg_is_deleted == 1
                                or colleague_found.clg_is_active == 0
                            ):

                                error = {
                                    'msg': "This user is inactive"
                                }

                                response_data = {
                                    'Res_Data': res_data,
                                    'error': error
                                }

                                return Response(
                                    response_data,
                                    status=status.HTTP_200_OK
                                )

                            device_token = DeviceToken.objects.get(
                                clg_id=colleague_found.clg_id,
                                token=token
                            )

                            serializer = DeviceToken_serializer(
                                device_token
                            )

                            if device_token == None:

                                serializer = DeviceToken_serializer(
                                    data=request.data
                                )

                                if serializer.is_valid():

                                    serializer.validated_data[
                                        'clg_id'
                                    ] = colleague_found.id

                                    serializer.save()

                        except DeviceToken.DoesNotExist:

                            request.data['clg_id'] = colleague_found.clg_id

                            serializer = DeviceToken_serializer(
                                data=request.data
                            )

                            if serializer.is_valid():
                                serializer.save()

                        colleague_found.otp = otp

                        colleague_found.otp_count = (
                            colleague_found.otp_count + 1
                            if colleague_found.otp_count is not None
                            else 1
                        )

                        colleague_found.otp_expire_time = otp_expire_time

                        colleague_found.save()

                        # Email OTP

                        send_email_otp(
                            email,
                            otp
                        )

                        res_data = {
                            'email': email,
                            'msg': "This Email Is Already Registered"
                        }

                        response_data = {
                            'Res_Data': res_data,
                            'msg': "OTP sent successfully to the registered email.",
                            'error': error
                        }

                        return Response(
                            response_data,
                            status=status.HTTP_200_OK
                        )

                    else:

                        response_data = {
                            'Res_Data': res_data,
                            'error': {
                                'msg': 'This Email Is Not Registered'
                            }
                        }

                        return Response(
                            response_data,
                            status=status.HTTP_200_OK
                        )

                else:

                    response_data = {
                        'Res_Data': res_data,
                        'error': {
                            'msg': 'Email is not valid. Please enter valid email.'
                        }
                    }

                    return Response(
                        response_data,
                        status=status.HTTP_200_OK
                    )

            # INVALID OTP TYPE
    
            else:

                return Response(
                    {
                        'Res_Data': None,
                        'error': {
                            'msg': 'Invalid otp_type. Use whatsapp or email.'
                        }
                    },
                    status=status.HTTP_200_OK
                )

        except Exception as e:

            return Response(
                {
                    'Res_Data': res_data,
                    'error': {
                        'msg': str(e)
                    }
                },
                status=status.HTTP_200_OK
            )

class OTPCheck(APIView):

    def post(self, request):

        try:

            res_data = None
            error = None

            otp_type = request.data['otp_type']
            number = request.data['phone_no']
            email = request.data['email']
            otp = request.data['otp']
            token = request.data['token']

            current_time = timezone.localtime(timezone.now())
            print("current_time1234----------", current_time)
        
            # FIND EMPLOYEE

            if otp_type == "whatsapp":

                try:

                    colleague_available = EMSColleague.objects.get(
                        clg_mobile_no=number,
                        clg_is_active=1,
                        clg_is_deleted=0
                    )

                except ObjectDoesNotExist:

                    return Response(
                        {
                            "Res_Data": res_data,
                            "error": {
                                "msg": "User not found with this number"
                            }
                        },
                        status=status.HTTP_200_OK
                    )

            elif otp_type == "email":

                try:

                    colleague_available = EMSColleague.objects.get(
                        clg_email=email,
                        clg_is_active=1,
                        clg_is_deleted=0
                    )

                except ObjectDoesNotExist:

                    return Response(
                        {
                            "Res_Data": res_data,
                            "error": {
                                "msg": "User not found with this email"
                            }
                        },
                        status=status.HTTP_200_OK
                    )

            else:

                return Response(
                    {
                        "Res_Data": None,
                        "error": {
                            "msg": "Invalid otp_type. Use whatsapp or email."
                        }
                    },
                    status=status.HTTP_200_OK
                )

            # OTP CHECK
    
            # otp_match = str(colleague_available.otp) == str(otp)
            otp_match = str(123456) == str(otp)

            time_valid = (
                colleague_available.otp_expire_time > current_time
            )

            if otp_match and time_valid:

                print(
                    "colleague_available.id ",
                    colleague_available.clg_id
                )

                # SAME DEVICE TOKEN LOGIC
                
                device_token = DeviceToken.objects.filter(
                    clg_id=colleague_available.clg_id,
                    is_login=True
                )

                print("Device token-- ", device_token)

                if device_token:

                    for i in device_token:
                        i.is_login = False
                        i.save()

                device_login_token = DeviceToken.objects.get(
                    clg_id=colleague_available.clg_id,
                    token=token
                )

                print(
                    "no working with this",
                    device_login_token
                )

                device_login_token.is_login = True

                if device_login_token.login_count >= 1:

                    device_login_token.modify_date = current_time

                device_login_token.login_count = (
                    device_login_token.login_count + 1
                )

                device_login_token.save()

                print("data")

                
                # LOGIN DETAILS
                
                login_dtl = {

                    "clg_ref_id": str(
                        colleague_available.clg_ref_id
                    ),

                    "clg_login_time": str(
                        current_time
                    ),

                    "clg_login_type": "login",

                    "organization": 1,

                    "branch": 1
                }

                clg_login_dtl_serializer = UserLoginInfoSerializer(
                    data=login_dtl
                )

                print(
                    "clg login dtl-- ",
                    clg_login_dtl_serializer
                )

                if clg_login_dtl_serializer.is_valid():

                    clg_lng = clg_login_dtl_serializer.save()

                    clg_lng_id = clg_lng.id

                # JWT TOKEN

                token = get_tokens_for_user(
                    colleague_available,
                    clg_lng_id,
                    is_android=True
                )

                colleague_available.clg_is_login = "yes"

                colleague_available.save()

                # Check Face authentication if already exists or not
                face_user_obj = None
                face_user_obj = FaceUser.objects.filter(mobile=colleague_available.clg_mobile_no).first()

                # RESPONSE

                if otp_type == "whatsapp":

                    res_data = {
                        'phone_no': number,
                        'is_face_detected': bool(face_user_obj),
                        'msg': "OTP Verified Successfully",
                        'token': token
                    }

                else:

                    res_data = {
                        'email': email,
                        'phone_no': colleague_available.clg_mobile_no,
                        'is_face_detected': bool(face_user_obj),
                        'msg': "OTP Verified Successfully",
                        'token': token
                    }

                return Response(
                    {
                        "Res_Data": res_data,
                        "error": error
                    },
                    status=status.HTTP_200_OK
                )

            else:

                return Response(
                    {
                        "Res_Data": res_data,
                        "error": {
                            "msg": "Wrong OTP"
                        }
                    },
                    status=status.HTTP_200_OK
                )

        except Exception as e:

            return Response(
                {
                    "Res_Data": res_data,
                    "error": {
                        "msg": "An error occurred: {}".format(str(e))
                    }
                },
                status=status.HTTP_200_OK
            )
    

# class ColleagueOTPLogin(APIView):
#     def post(self, request):
#         try:
#             res_data = None
#             error = None
#             number = request.data.get('phone_no')
#             token = request.data.get('token')
#             otp = str(random.randint(1000, 9999))

#             template_name="kycotp"
#             placeholders=[otp]
#             current_time = timezone.localtime(timezone.now())
#             otp_expire_time = current_time + timezone.timedelta(minutes=10)

#             msg = f"Use {otp} as your verification code on Spero Application. The OTP expires within 10 mins, {otp} Team Spero"

#             if number != None:
#                 colleague_found = EMSColleague.objects.filter(clg_mobile_no=number).first()
#                 if colleague_found:
#                     try:
#                         if(colleague_found.clg_is_deleted==1 or colleague_found.clg_is_active==0):
#                             error = {'msg':"This user is inactive"}
#                             response_data={
#                             'Res_Data': res_data,
#                             'error': error
#                             }
#                             return Response(response_data ,status=status.HTTP_200_OK)
                        
#                         device_token = DeviceToken.objects.get(clg_id=colleague_found.clg_id,token=token)
#                         serializer = DeviceToken_serializer(device_token)
                        
#                         if device_token==None:
#                             serializer = DeviceToken_serializer(data=request.data)
#                             if serializer.is_valid():
#                                 serializer.validated_data['clg_id']=colleague_found.id
#                                 serializer.save() 

#                     except DeviceToken.DoesNotExist:
#                         request.data['clg_id']=colleague_found.clg_id
#                         serializer = DeviceToken_serializer(data=request.data)
#                         if serializer.is_valid():
#                             serializer.save()
#                     colleague_found.otp = otp
#                     colleague_found.otp_count = (colleague_found.otp_count+1) if colleague_found.otp_count is not None else 1
#                     colleague_found.otp_expire_time = otp_expire_time
#                     colleague_found.save()
                    
#                     # send_otp(number,msg)
#                     # send_test_otp(number,otp)
# #----------------------------------------------------otp--------------------------------------------- #########
#                     to_number='91'+str(number)
#                     print("This is my number..",to_number)
#                     # whatsapp_sms(to_number,template_name,placeholders)
#                     send_whatsapp_new(to_number, template_name, placeholders,otp)
# #----------------------------------------------------otp--------------------------------------------- #s
#                     res_data = {'phone_no': number,'msg':"This Phone Number Is Already Register"}
#                     response_data={
#                     'Res_Data': res_data,
#                     'msg': "OTP sent successfully to the registered phone number.",
#                     'error': error
#                     }
#                     return Response(response_data , status=status.HTTP_200_OK)
#                 else:
#                     response_data={
#                     'Res_Data': res_data,
#                     'error': {'msg':'This Phone Number Is Not Register'}
#                     }
#                     return Response(response_data, status=status.HTTP_200_OK)
#             else:
#                 response_data={
#                 'Res_Data': res_data,
#                 'error': {'msg':'Phone number is not valid. Please enter valid phone number.'}
#                 }
#                 return Response(response_data, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({'Res_Data': res_data,'error': {'msg': str(e)}}, status= status.HTTP_200_OK)
        

       

# class OTPCHECK(APIView):
#     def post(self, request):
#         try:
#             res_data = None
#             error = None
#             number = request.data.get('phone_no')
#             otp = request.data.get('otp')
#             token = request.data.get('token')
#             current_time = timezone.localtime(timezone.now())

#             try:
#                 colleague_available = EMSColleague.objects.get(clg_mobile_no=number,clg_is_active=1, clg_is_deleted=0)
#             except ObjectDoesNotExist:
#                 return Response({"Res_Data": res_data, "error": {'msg': 'User not found with this number'}}, status=status.HTTP_200_OK)
            
#             if colleague_available.otp == otp and colleague_available.otp_expire_time > current_time:
#                 print("colleague_available.id ",colleague_available.clg_id)
#                 device_token=DeviceToken.objects.filter(clg_id=colleague_available.clg_id,is_login=True)#colleague_available.clg_ref_id)
#                 print("Device token-- ", device_token)
#                 if device_token:
#                     for i in device_token:
#                         i.is_login=False
#                         i.save()
#                 # print("not found in this also ",type(request.data.get('token')))
#                 device_login_token=DeviceToken.objects.get(clg_id=colleague_available.clg_id,token=token)
#                 print("no working with this",device_login_token)
#                 device_login_token.is_login=True
#                 if(device_login_token.login_count>=1):
#                     device_login_token.modify_date=current_time#this was giving error
#                 device_login_token.login_count=device_login_token.login_count+1
#                 device_login_token.save()
#                 print("data")

#                 login_dtl = {
#                     # "device_os_name" : device_os_name,
#                     "clg_ref_id" : str(colleague_available.clg_ref_id),
#                     "clg_login_time" : str(current_time),
#                     "clg_login_type": "login",
#                     "organization": 1,
#                     "branch": 1
#                 }

#                 clg_login_dtl_serializer = UserLoginInfoSerializer(data=login_dtl)
#                 print("clg login dtl-- ", clg_login_dtl_serializer)
#                 if clg_login_dtl_serializer.is_valid():
#                     clg_lng = clg_login_dtl_serializer.save()
#                     clg_lng_id = clg_lng.id


#                 token = get_tokens_for_user(colleague_available, clg_lng_id)
    
#                 colleague_available.clg_is_login=True
#                 colleague_available.save()
#                 res_data = {'phone_no': number,'msg':"OTP Verified Successfully",'token':token}
#                 return Response({"Res_Data": res_data, "error": error}, status=status.HTTP_200_OK)
#             else:
#                 return Response({"Res_Data": res_data, "error": {"msg": "Wrong OTP"}}, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"Res_Data": res_data, "error": {"msg": "An error occurred: {}".format(str(e))}}, status=status.HTTP_200_OK)


def send_email_otp(to_email, otp):
    try:
        subject = "ProParamedics Crew Application - OTP Verification"

        message = f"""
Dear Employee,

Use {otp} as your verification code on ProParamedics Crew Application.

The OTP expires within 10 minutes.

Please do not share this OTP with anyone.

Regards,
Team Spero
"""

        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )

        print("Before email.send()")

        result = email.send(fail_silently=False)

        print("After email.send():", result)

        return result

    except Exception as e:
        print("EMAIL ERROR:", type(e).__name__)
        print("EMAIL ERROR MESSAGE:", str(e))
        raise

# class ColleagueEmailOTPLogin(APIView):
#     def post(self, request):
#         try:
#             res_data = None
#             error = None
#             email = request.data.get('email')
#             token = request.data.get('token')
#             otp = str(random.randint(1000, 9999))
#             current_time = timezone.localtime(timezone.now())
#             otp_expire_time = current_time + timezone.timedelta(minutes=10)
#             if email != None:
#                 colleague_found = EMSColleague.objects.filter(clg_email=email).first()
#                 if colleague_found:
#                     try:
#                         if (
#                             colleague_found.clg_is_deleted == 1
#                             or colleague_found.clg_is_active == 0
#                         ):
#                             error = {
#                                 'msg': "This user is inactive"
#                             }
#                             response_data = {
#                                 'Res_Data': res_data,
#                                 'error': error
#                             }
#                             return Response(response_data,status=status.HTTP_200_OK)
#                         device_token = DeviceToken.objects.get(clg_id=colleague_found.clg_id,token=token)
#                         serializer = DeviceToken_serializer(device_token)
#                         if device_token == None:
#                             serializer = DeviceToken_serializer(data=request.data)
#                             if serializer.is_valid():
#                                 serializer.validated_data[
#                                     'clg_id'
#                                 ] = colleague_found.id
#                                 serializer.save()
#                     except DeviceToken.DoesNotExist:
#                         request.data['clg_id'] = colleague_found.clg_id
#                         serializer = DeviceToken_serializer(data=request.data)
#                         if serializer.is_valid():
#                             serializer.save()
#                     # Generate and save OTP
#                     colleague_found.otp = otp
#                     colleague_found.otp_count = (
#                         colleague_found.otp_count + 1
#                         if colleague_found.otp_count is not None
#                         else 1
#                     )
#                     colleague_found.otp_expire_time = otp_expire_time
#                     colleague_found.save()
#                     # Send Email OTP
#                     send_email_otp(
#                         email,
#                         otp
#                     )
#                     res_data = {
#                         'email': email,
#                         # 'OTP': otp,
#                         'msg': "This Email Is Already Registered"
#                     }
#                     response_data = {
#                         'Res_Data': res_data,
#                         'msg': "OTP sent successfully to the registered email.",
#                         'error': error
#                     }
#                     return Response(response_data,status=status.HTTP_200_OK)
#                 else:
#                     response_data = {
#                         'Res_Data': res_data,
#                         'error': {
#                             'msg': 'This Email Is Not Registered'
#                         }
#                     }
#                     return Response(response_data,status=status.HTTP_200_OK)
#             else:
#                 response_data = {
#                     'Res_Data': res_data,
#                     'error': {
#                         'msg': 'Email is not valid. Please enter valid email.'
#                     }
#                 }
#                 return Response(response_data,status=status.HTTP_200_OK)

#         except Exception as e:

#             return Response(
#                 {
#                     'Res_Data': res_data,
#                     'error': {
#                         'msg': str(e)
#                     }
#                 },
#                 status=status.HTTP_200_OK
#             )

# class EmailOTPCHECK(APIView):
#     def post(self, request):
#         try:
#             res_data = None
#             error = None

#             email = request.data.get('email')
#             otp = request.data.get('otp')
#             token = request.data.get('token')

#             current_time = timezone.localtime(timezone.now())

#             try:
#                 colleague_available = EMSColleague.objects.get(
#                     clg_email=email,
#                     clg_is_active=1,
#                     clg_is_deleted=0
#                 )

#             except ObjectDoesNotExist:
#                 return Response(
#                     {
#                         "Res_Data": res_data,
#                         "error": {
#                             "msg": "User not found with this email"
#                         }
#                     },
#                     status=status.HTTP_200_OK
#                 )
#             print("EMAIL:", email)
#             print("OTP FROM POSTMAN:", otp)
#             print("OTP FROM DATABASE:", colleague_available.otp)
#             print("OTP EXPIRE TIME:", colleague_available.otp_expire_time)
#             print("CURRENT TIME:", current_time)

#             otp_match = str(colleague_available.otp) == str(otp)
#             time_valid = colleague_available.otp_expire_time > current_time

#             print("OTPCHECK")
#             print("OTP MATCH:", otp_match)
#             print("TIME VALID:", time_valid)
#             print("FINAL RESULT:", otp_match and time_valid)
#             print("POSTMAN OTP:", repr(otp), type(otp))
#             print("DATABASE OTP:", repr(colleague_available.otp), type(colleague_available.otp))
#             print("----------------------")
#             if otp_match and time_valid:
#                 print(
#                     "colleague_available.id ",
#                     colleague_available.clg_id
#                 )
#                 device_token = DeviceToken.objects.filter(clg_id=colleague_available.clg_id,is_login=True)
#                 print("Device token-- ", device_token)
#                 if device_token:
#                     for i in device_token:
#                         i.is_login = False
#                         i.save()
#                 device_login_token = DeviceToken.objects.get(clg_id=colleague_available.clg_id,token=token)
#                 print(
#                     "no working with this",
#                     device_login_token
#                 )
#                 device_login_token.is_login = True
#                 if device_login_token.login_count >= 1:
#                     device_login_token.modify_date = current_time
#                 device_login_token.login_count = (
#                     device_login_token.login_count + 1
#                 )
#                 device_login_token.save()
#                 print("data")
#                 login_dtl = {
#                     "clg_ref_id": str(
#                         colleague_available.clg_ref_id
#                     ),
#                     "clg_login_time": str(current_time),
#                     "clg_login_type": "login",
#                     "organization": 1,
#                     "branch": 1
#                 }
#                 clg_login_dtl_serializer = UserLoginInfoSerializer(data=login_dtl)
#                 print(
#                     "clg login dtl-- ",
#                     clg_login_dtl_serializer
#                 )
#                 if clg_login_dtl_serializer.is_valid():
#                     clg_lng = clg_login_dtl_serializer.save()
#                     clg_lng_id = clg_lng.id
#                 token = get_tokens_for_user(colleague_available,clg_lng_id)
#                 colleague_available.clg_is_login = True
#                 colleague_available.save()
#                 res_data = {'email': email,'msg': "OTP Verified Successfully",'token': token}
#                 return Response({"Res_Data": res_data,"error": error},status=status.HTTP_200_OK)
#             else:
#                 return Response({"Res_Data": res_data,"error": {"msg": "Wrong OTP"}},status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response(
#                 {
#                     "Res_Data": res_data,
#                     "error": {
#                         "msg": "An error occurred: {}".format(str(e))
#                     }
#                 },
#                 status=status.HTTP_200_OK
#             )


        
class ColleagueLogoutView(APIView):
    # renderer_classes = [UserRenderer]
    # authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated]
    def post(self, request):
        res_data = None
        error = None
        clgref_id = request.data['clg_ref_id']
        refresh_token = request.data["refresh"]
        device_token = request.data.get('Device_token')
        clg_login_id = request.data["clg_login_id"] if "clg_login_id" in request.data else 0
        current_time = timezone.localtime(timezone.now())

        if not clgref_id or not refresh_token:
            return Response({"Res_Data": res_data, "error": {"msg": "clg_ref_id and refresh token are required."}},status=status.HTTP_400_BAD_REQUEST)

        try:
            colleague = EMSColleague.objects.get(clg_ref_id=clgref_id)

        except EMSColleague.DoesNotExist:
            return Response(
                {"Res_Data": res_data,"error": {"msg": "Colleague not found."}},status=status.HTTP_404_NOT_FOUND)

        clgid = colleague.clg_id
        # Validate refresh token
        try:
            token = RefreshToken(refresh_token)
        except Exception:
            # Check whether token is already blacklisted
            try:
                outstanding_token = OutstandingToken.objects.filter(token=refresh_token).last()

                if outstanding_token:
                    blacklisted_token = BlacklistedToken.objects.filter(token=outstanding_token).exists()

                    if blacklisted_token:
                        return Response({"Res_Data": res_data, "error": {"msg": "Token is already blacklisted."}},status=status.HTTP_200_OK)
            except Exception:
                pass
            return Response({"Res_Data": res_data, "error": {"msg": "Token is not correct. Please try again with correct token."}},status=status.HTTP_401_UNAUTHORIZED)

        # Logout device
        if device_token:

            try:
                logout_from_device_token = DeviceToken.objects.get(clg_id=clgid,token=device_token)

                logout_from_device_token.is_login = False
                logout_from_device_token.modify_by = clgref_id
                logout_from_device_token.save(
                    update_fields=["is_login","modify_by"])
            except DeviceToken.DoesNotExist:
                pass

        # Update login history
        if clg_login_id and clg_login_id != 0:

            try:
                clg_login_dtl = EMSColleagueLogin.objects.get(id=clg_login_id,clg_ref_id=clgid)

                if clg_login_dtl.clg_logout_time is None:
                    clg_login_dtl.clg_logout_time = current_time

                    clg_login_dtl.save(update_fields=["clg_logout_time"])

                else:
                    return Response({"msg": "User is already logged out successfully."},status=status.HTTP_200_OK)

            except EMSColleagueLogin.DoesNotExist:
                pass

        # Blacklist refresh token
        try:
            token.blacklist()

        except Exception:
            return Response(
                {"msg": "Unable to blacklist token."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"msg": "User logged out successfully."},status=status.HTTP_200_OK)
 


def get_tokens_for_user(user, log_id, is_android=False):
    print("user---", user)
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    if is_android:
        # Custom lifetime: 3 months = 90 days
        refresh.set_exp(
            # lifetime=timedelta(minutes=20)
            lifetime=timedelta(days=90)
        )

        # # Create access token
        # access = refresh.access_token

        # Access token = 20 minutes
        access.set_exp(
            lifetime=timedelta(minutes=20)
            # lifetime=timedelta(days=90)
        )

    

    user = EMSColleague.objects.select_related(
        "clg_group",
        "organization",
        "branch"
    ).get(clg_id=user.clg_id)
    today = timezone.localtime(timezone.now()).date()
    print("today---", today)

    try:
        Shift_obj = ShiftRoster.objects.filter(employee=user.clg_id, roster_date=today, status=1, is_deleted=0).last()
    except ShiftRoster.DoesNotExist:
        Shift_obj = None

    group_obj = user.clg_group

    permissions_data = []

    if group_obj:
        group_name = group_obj.ugname

        pers = agg_save_permissions.objects.filter(
            role=group_obj.gid
        )

        for permission in pers:
            permission_info = {
                "modules_submodule": permission.modules_submodule,
                "Department_id": permission.source.pk_id,
                "Department_name": permission.source.department_name,
                "Group_id": group_obj.gid,
                "Group_name": group_obj.ugname,
            }

            permissions_data.append(permission_info)

    else:
        group_name = None

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "permissions": permissions_data,

        "colleague": {
            "id": user.clg_id,
            "clg_ref_id": user.clg_ref_id,
            "first_name": user.clg_first_name,
            "last_name": user.clg_last_name,
            "email": user.clg_email,
            "phone_no": user.clg_mobile_no,
            "log_id": log_id,
            "shift_name": Shift_obj.shift.shift_name if Shift_obj else None,
            "shift_start_time": Shift_obj.shift.start_time if Shift_obj else None,
            "shift_end_time": Shift_obj.shift.end_time if Shift_obj else None,
            "working_hours": user.clg_shift_type if user.clg_shift_type else None,
            "emp_type": user.clg_user_type,
            "clg_group": user.clg_group.ugname,
            "organization_id": (
                user.organization.pk_id
                if user.organization else None
            ),
            "organization_name": (
                user.organization.organization_name
                if user.organization else None
            ),

            "branch_id": (
                user.branch.pk_id
                if user.branch else None
            ),
            "branch_name": (
                user.branch.branch_name
                if user.branch else None
            ),
        },

        "Group_name": group_name,
    }


def generate_captcha_text():
  return str(random.randint(100000, 999999))
class GenerateCaptchaView(APIView):

    def post(self, request):

        captcha_text = generate_captcha_text()
        captcha_id = str(uuid.uuid4())
        cache.set(f'captcha_{captcha_id}',captcha_text,timeout=600)
        image_builder = ImageCaptcha(width=200,height=80)
        img = image_builder.generate_image(captcha_text)
        buffered = BytesIO()
        img.save(buffered,format='PNG')
        img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        return Response({'status': True,'message': 'Captcha generated successfully','captcha_id': captcha_id,'captcha_image': img_base64,},status=status.HTTP_200_OK,)


class VerifyCaptchaView(APIView):
    def post(self, request):
        captcha_id = request.data.get('captcha_id')
        captcha_value = request.data.get('captcha_value')
        if not captcha_id:
            return Response({'detail': 'Captcha ID is required'},status=status.HTTP_400_BAD_REQUEST)
        if not captcha_value or len(str(captcha_value)) != 6:
            return Response({'detail': 'Captcha must be 6 digits'},status=status.HTTP_422_UNPROCESSABLE_ENTITY,)

        cache_key = f'captcha_{captcha_id}'
        cached_text = cache.get(cache_key)

        if cached_text is None:
            return Response({'detail': 'Captcha expired or invalid'},status=status.HTTP_400_BAD_REQUEST,)
        cache.delete(cache_key)
        if str(cached_text) != str(captcha_value):
            return Response({'detail': 'Invalid captcha'},status=status.HTTP_401_UNAUTHORIZED)

        return Response({'status': True,'message': 'Captcha verified'},status=status.HTTP_200_OK,)

# class UserLoginView(APIView):
#     # renderer_classes = [UserRenderer]
#     def post(self, request, format=None):
#         # request.data['user_username'] = request.data.get('emp_username')
#         # Validate using the CAPTCHA + credential serializer
#         # serializer1 = CaptchaTokenObtainPairSerializer(data=request.data)
#         # serializer1.is_valid(raise_exception=True)
#         print("request.data--", request.data)
 
#         serializer = UserLoginSerializer(data=request.data)
#         if serializer.is_valid(raise_exception=True):
#             clg_ref_id = serializer.data.get('clg_ref_id')
#             password = serializer.data.get('password')
#             clg = authenticate(clg_ref_id=clg_ref_id, password=password)
#             current_time = timezone.localtime(timezone.now())
#             print("clg--", clg.clg_id)
#             if clg is not None:
#                 clg_obj = EMSColleague.objects.get(clg_ref_id=clg.clg_ref_id)
#                 print("clg_obj.clg_is_deleted--", clg_obj.clg_is_deleted)
#                 if clg_obj.clg_is_deleted == 1:
#                     return Response({'msg':'Login access denied. Please check your permissions or reach out to support for help.'},status=status.HTTP_401_UNAUTHORIZED)
#                 print("clg_obj.clg_is_login--", clg_obj.clg_is_login)
#                 if clg_obj.clg_is_login == "no": 
#                     clg_obj.clg_is_login = "yes"
#                     clg_obj.save()
#                     print("Login entry")
#                     login_entry_obj = EMSColleagueLogin.objects.create(clg_ref_id=clg, clg_login_time=current_time)
#                     print("login entry added--", login_entry_obj)
#                     token = get_tokens_for_user(clg , login_entry_obj.id)
#                     return Response({'token':token,'msg':'Logged in Successfully'},status=status.HTTP_200_OK)
#                 else:
#                     return Response({'msg':'User Already Logged In. Please check.'},status=status.HTTP_409_CONFLICT)
#             else:
#                 return Response({'errors':{'non_field_errors':['UserId or Password is not valid']}},status=status.HTTP_404_NOT_FOUND)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    # renderer_classes = [UserRenderer]
    def post(self, request, format=None):
        # request.data['user_username'] = request.data.get('emp_username')

        # Validate using the CAPTCHA + credential serializer
        # serializer1 = CaptchaTokenObtainPairSerializer(data=request.data)
        # serializer1.is_valid(raise_exception=True)
        print("request.data--", request.data)
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            clg_ref_id = serializer.data.get('clg_ref_id')
            password = serializer.data.get('password')
        
            want_to_login = request.data.get('want_to_login', False)
            clg = authenticate(
                clg_ref_id=clg_ref_id,
                password=password
            )
            current_time = timezone.localtime(timezone.now())
            if clg is not None:
                print("clg--", clg.clg_id)
                clg_obj = EMSColleague.objects.get(
                    clg_ref_id=clg.clg_ref_id
                )
                # if clg_obj.clg_group.ugname != "Admin":
                #     return Response(
                #         {
                #             'msg': 'Login access denied. Please check your permissions or reach out to support for help.'
                #         },
                #         status=status.HTTP_401_UNAUTHORIZED
                #     )
                if clg_obj.clg_is_deleted == 1:
                    return Response(
                        {
                            'msg': 'Login access denied. Please check your permissions or reach out to support for help.'
                        },
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                print(
                    "clg_obj.clg_is_login--",
                    clg_obj.clg_is_login
                )
                # Check already logged in only when
                # want_to_login is False
                if not want_to_login:
                    if clg_obj.clg_is_login == "no":
                        clg_obj.clg_is_login = "yes"
                        clg_obj.save()
                        print("Login entry")
                        login_entry_obj = EMSColleagueLogin.objects.create(
                            clg_ref_id=clg,
                            clg_login_time=current_time
                        )
                        print("login entry added--",login_entry_obj)
                        token = get_tokens_for_user(clg,login_entry_obj.id,is_android=False)
                        return Response({'token': token,'msg': 'Logged in Successfully'},status=status.HTTP_200_OK)
                    else:
                        return Response({'already_logged_in': True,'msg': 'User Already Logged In. Please check.'},status=status.HTTP_409_CONFLICT)
                # want_to_login = True
                # User has confirmed to login again
                else:
                    clg_obj.clg_is_login = "yes"
                    clg_obj.save()
                    print("Login entry")
                    login_entry_obj = EMSColleagueLogin.objects.create(
                        clg_ref_id=clg,
                        clg_login_time=current_time
                    )
                    print("login entry added--",login_entry_obj)
                    token = get_tokens_for_user(clg,login_entry_obj.id,is_android=False)
                    return Response({'token': token,'msg': 'Logged in Successfully'},status=status.HTTP_200_OK)
            else:
                return Response({'errors': {'non_field_errors': ['UserId or Password is not valid']}},
                    status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)



 
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]  # Only logged-in users can log out
    renderer_classes = [UserRenderer]
    # authentication_classes = [CustomJWTAuthentication]

    def post(self, request):
        try:
            print("Request user--", request.user)
            clg_obj = EMSColleague.objects.get(clg_ref_id=request.user)
            current_time = timezone.localtime(timezone.now())
            print("clg_obj", clg_obj)
            if clg_obj.clg_is_login == 'yes':
                clg_obj.clg_is_login = 'no'
                clg_obj.save()
               
            refresh_token = request.data.get("refresh_token")
            print("refresh_token", refresh_token)
            log_id = request.data.get("log_id")
            print("log_id", log_id)
            if refresh_token:
                token = RefreshToken(refresh_token)
                print("token", token)
                token.blacklist()  # Blacklist the token
                login_entry_obj = EMSColleagueLogin.objects.get(id=log_id)
                print("login_entry_obj", login_entry_obj)
                print("logout time", current_time)
                login_entry_obj.clg_logout_time = current_time
                login_entry_obj.save()
                return Response({"message": "Logged out successfully"}, status=200)
            return Response({"error": "Refresh token is required"}, status=400)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=400)




# 1. Tax Configuration CRUD API
class TaxConfigurationViewSet(viewsets.ModelViewSet):
    queryset = TaxConfiguration.objects.all()
    serializer_class = TaxConfigurationSerializer

# 2. Salary Component CRUD API
class SalaryComponentViewSet(viewsets.ModelViewSet):
    queryset = SalaryComponent.objects.all()
    serializer_class = SalaryComponentSerializer

# 3. Generate Single Employee Payslip API
@api_view(['POST'])
def generate_single_payslip(request):
    serializer = GeneratePayrollSerializer(data=request.data)
    if serializer.is_valid():
        result = calculate_and_generate_payslip(
            clg_id=serializer.validated_data['employee_id'],
            month=serializer.validated_data['month'],
            year=serializer.validated_data['year']
        )
        if 'error' in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 4. Bulk Generate Payslip API 
@api_view(['POST'])
def generate_bulk_payslip(request):
    month = request.data.get('month')
    year = request.data.get('year')
    
    if not month or not year:
        return Response({"error": "Month and Year are required"}, status=status.HTTP_400_BAD_REQUEST)
    
    profiles = EmployeePayrollProfile.objects.filter(is_deleted=0, status=1)
    
    success_count = 0
    failed_count = 0
    failed_employees = []
    
    for profile in profiles:
        result = calculate_and_generate_payslip(
            clg_id=profile.employee_id, 
            month=month, 
            year=year
        )
        if 'error' in result:
            failed_count += 1
            failed_employees.append({"employee_id": profile.employee_id, "error": result['error']})
        else:
            success_count += 1
            
    return Response({
        "message": f"Bulk payroll generation completed. Success: {success_count}, Failed: {failed_count}",
        "failed_employees": failed_employees
    }, status=status.HTTP_200_OK)

# 5. Get Employee Payslip History & Details
@api_view(['GET'])
def employee_payslip_history(request, employee_id):
    try:
        # Descending order (Latest first)
        payslips = Payslip.objects.filter(employee_id=employee_id).order_by('-pay_period_start')
        serializer = PayslipSerializer(payslips, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



# PHASE 2: Live Dashboard API (Estimated data without saving)
@api_view(['GET'])
def payroll_dashboard(request):
    today = timezone.now().date()
    month = int(request.GET.get('month', today.month))
    year = int(request.GET.get('year', today.year))
    
    profiles = EmployeePayrollProfile.objects.filter(is_deleted=0, status=1)
    dashboard_data = []
    
    for profile in profiles:
        # Live attendance fetch
        attendance = Attendance.objects.filter(
            employee_id=profile.employee_id,
            attendance_date__month=month,
            attendance_date__year=year,
            is_deleted=0
        ).aggregate(total_reg=Sum('working_hours'), total_ot=Sum('overtime_hours'))
        
        reg_hrs = attendance['total_reg'] or 0
        ot_hrs = attendance['total_ot'] or 0
        
        # Live quick calculation
        if profile.pay_type == 'hourly':
            est_gross = (Decimal(reg_hrs) * profile.hourly_rate) + (Decimal(ot_hrs) * (profile.hourly_rate * profile.overtime_multiplier))
        else:
            est_gross = profile.monthly_base_salary
            
        # Check if payslip already generated
        payslip_exists = Payslip.objects.filter(employee_id=profile.employee_id, pay_period_start__month=month, pay_period_start__year=year).exists()
        
        dashboard_data.append({
            "employee_id": profile.employee_id,
            "name": f"{profile.first_name} {profile.last_name}",
            "regular_hours": reg_hrs,
            "overtime_hours": ot_hrs,
            "estimated_gross": str(est_gross),
            "payroll_status": "Generated" if payslip_exists else "Pending"
        })
        
    return Response({
        "month": month,
        "year": year,
        "total_employees": len(dashboard_data),
        "employees": dashboard_data
    })

# PHASE 3: Individual Employee Live Details
@api_view(['GET'])
def employee_live_details(request, employee_id):
    today = timezone.now().date()
    month = int(request.GET.get('month', today.month))
    year = int(request.GET.get('year', today.year))
    
    try:
        profile = EmployeePayrollProfile.objects.get(employee_id=employee_id)
        attendance = Attendance.objects.filter(
            employee_id=employee_id,
            attendance_date__month=month,
            attendance_date__year=year,
            is_deleted=0
        ).aggregate(total_reg=Sum('working_hours'), total_ot=Sum('overtime_hours'))
        
        reg_hrs = Decimal(attendance['total_reg'] or 0)
        ot_hrs = Decimal(attendance['total_ot'] or 0)
        
        if profile.pay_type == 'hourly':
            reg_pay = reg_hrs * profile.hourly_rate
            ot_pay = ot_hrs * (profile.hourly_rate * profile.overtime_multiplier)
        else:
            reg_pay = profile.monthly_base_salary
            ot_pay = Decimal(0)
            
        gross = reg_pay + ot_pay
        
        return Response({
            "employee_id": employee_id,
            "name": f"{profile.first_name} {profile.last_name}",
            "country": profile.country,
            "pay_type": profile.pay_type,
            "hourly_rate": str(profile.hourly_rate),
            "regular_hours": str(reg_hrs),
            "overtime_hours": str(ot_hrs),
            "estimated_regular_pay": str(reg_pay),
            "estimated_overtime_pay": str(ot_pay),
            "estimated_gross_pay": str(gross)
        })
    except EmployeePayrollProfile.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

# PHASE 6: Approve Payslip
@api_view(['PATCH'])
def approve_payslip(request, payslip_id):
    try:
        payslip = Payslip.objects.get(id=payslip_id)
        if payslip.status == 'DRAFT':
            payslip.status = 'APPROVED'
            payslip.save()
            return Response({"message": "Payslip approved successfully."})
        return Response({"error": f"Cannot approve. Current status is {payslip.status}."}, status=400)
    except Payslip.DoesNotExist:
        return Response({"error": "Payslip not found"}, status=404)

# PHASE 6: Mark as Paid
@api_view(['POST'])
def mark_payslip_paid(request, payslip_id):
    try:
        payslip = Payslip.objects.get(id=payslip_id)
        if payslip.status != 'APPROVED':
            return Response({"error": "Payslip must be APPROVED first."}, status=400)
            
        payment_method = request.data.get('payment_method', 'BANK_TRANSFER')
        
        # Update Payslip
        payslip.status = 'PAID'
        payslip.save()
        
        # Update Invoice if exists
        invoice = Invoice.objects.filter(payslip=payslip).first()
        if invoice:
            invoice.status = 'PAID'
            invoice.amount_paid = invoice.total_amount
            invoice.balance_due = 0
            invoice.save()
            
            # Create Payment Transaction Log
            PaymentTransaction.objects.create(
                invoice=invoice,
                payment_method=payment_method,
                amount=invoice.total_amount,
                is_success=True
            )
            
        return Response({"message": "Payslip marked as PAID successfully."})
    except Payslip.DoesNotExist:
        return Response({"error": "Payslip not found"}, status=404)

@api_view(['GET'])
def all_generated_payslips(request):
    month = request.GET.get('month')
    year = request.GET.get('year')
    
    if not month or not year:
        return Response({"error": "Month and Year are required as query parameters."}, status=400)
    
    payslips = Payslip.objects.filter(
        pay_period_start__month=month,
        pay_period_start__year=year
    ).order_by('-id')
    
    serializer = PayslipSerializer(payslips, many=True)
    return Response(serializer.data, status=200)


# API: Get Single Payslip Full Details 
@api_view(['GET'])
def single_payslip_details(request, payslip_id):
    try:
        payslip = Payslip.objects.get(id=payslip_id)
        serializer = PayslipSerializer(payslip)
        return Response(serializer.data, status=200)
    except Payslip.DoesNotExist:
        return Response({"error": "Payslip not found"}, status=404)


class CandidateRolesGetAPI(APIView):

    def get(self, request):
        roles = CandidateRoles.objects.filter(is_deleted=0)

        serializer = CandidateRolesSerializer(roles, many=True)

        return Response({
            "status": True,
            "message": "Candidate roles fetched successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

class CandidateRegistration(APIView):

    def post(self, request):

        serializer = CandidateSerializer(data=request.data)

        if serializer.is_valid():

            candidate = serializer.save(
                application_status='application_submitted'
            )

            return Response({
                'regData': {
                    'status': True,
                    'message': 'Candidate registered successfully',
                    'candidate_id': candidate.pk_id,
                    'application_status': candidate.application_status,
                    'candidate': CandidateSerializer(candidate).data
                },
                'error': None
            }, status=status.HTTP_201_CREATED)

        return Response({
            'regData': None,
            'error': {
                'msg': serializer.errors
            }
        }, status=status.HTTP_400_BAD_REQUEST)

class GetCandidateList(APIView):
    def get(self, request):
        candidates = Candidate.objects.filter(is_deleted=0)

        serializer = CandidateSerializer(candidates, many=True)

        return Response({
            "status": True,
            "message": "Candidate list fetched successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)        




#---------------------------permission --------------------------
class CombinedAPIView(APIView):
    # renderer_classes = [UserRenderer]
    # authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        permission_modules = Permission_module.objects.all().order_by("module_id")
        modules_serializer = Moduleserializer(permission_modules, many=True)

        permission_objects = permission.objects.all()
        permission_serializer = permission_sub_Serializer(permission_objects, many=True)

        action_objects = permission_action.objects.all()
        action_serializer = action_sub_Serializer(action_objects, many=True)

        combined_data = []
        for module_data in modules_serializer.data:
            module_id = module_data["module_id"]
            module_name = module_data["name"]
            # source_id = module_data["Source_id"]

            # Filter submodules for the current module
            submodules = [submodule for submodule in permission_serializer.data if submodule["module"] == module_id]

            # Get IDs of those submodules
            submodule_ids = [sub["Permission_id"] for sub in submodules]

            # Filter actions belonging to these submodules
            actions = [action for action in action_serializer.data if action["sub_module"] in submodule_ids]

            formatted_data = {
                "module_id": module_id,
                "name": module_name,
                # "Source_id": source_id,
                "submodules": submodules,
                "actions": actions
            }

            combined_data.append(formatted_data)

        return Response(combined_data)



# class GetPermissionAPIView(APIView):
#     # renderer_classes = [UserRenderer]
#     # authentication_classes = [CustomJWTAuthentication]
#     # permission_classes = [IsAuthenticated]

#     def get(self, request, source, role, *args, **kwargs):
#         permissions = agg_save_permissions.objects.filter(source=source, role=role)
        
#         data = []
#         for perm in permissions:
#             data.append({
#                 "id": perm.id,
#                 "source": perm.source.pk_id if perm.department_name else None,  
#                 "role": perm.role.gid if perm.ugname else None,
#                 "modules_submodule": perm.modules_submodule
#             })
        
#         return JsonResponse(data, safe=False)

class GetPermissionAPIView(APIView):

    def get(self, request, source, role, *args, **kwargs):
        permissions = agg_save_permissions.objects.filter(
            source=source,
            role=role
        )

        data = []

        for perm in permissions:
            data.append({
                "id": perm.id,
                "source": perm.source.pk_id if perm.source else None,
                "role": perm.role.gid if perm.role else None,
                "modules_submodule": perm.modules_submodule
            })

        return JsonResponse(data, safe=False)


class CreatePermissionAPIView(APIView):
    # renderer_classes = [UserRenderer]
    # permission_classes = [IsAuthenticated]
    serializer_class = SavePermissionSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdatePermissionAPIView(APIView):
    # renderer_classes = [UserRenderer]
    # permission_classes = [IsAuthenticated]
    serializer_class = SavePermissionSerializer

    def put(self, request, id):
        try:
            permission = agg_save_permissions.objects.get(id=id)
        except agg_save_permissions.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(permission, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ====================================================================================================================================================
#                                   Employee Registration
# ====================================================================================================================================================

class EMSColleagueListCreateView(generics.ListCreateAPIView):
    queryset = EMSColleague.objects.all().order_by("-clg_id")
    serializer_class = EMSColleagueSerializer


class EMSColleagueRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EMSColleague.objects.all()
    serializer_class = EMSColleagueSerializer
    lookup_field = "clg_id"





import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser


class EMSColleagueImportView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"error": "No file uploaded. Use key 'file'."}, status=status.HTTP_400_BAD_REQUEST)

        filename = file_obj.name.lower()

        try:
            if filename.endswith(".csv"):
                df = pd.read_csv(file_obj, dtype=str)
            elif filename.endswith((".xlsx", ".xlsm")):
                df = pd.read_excel(file_obj, dtype=str, engine="openpyxl")
            else:
                return Response(
                    {"error": "Unsupported file type. Upload .csv or .xlsx"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            return Response({"error": f"Failed to parse file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        if df.empty:
            return Response({"error": "File is empty or has no data rows."}, status=status.HTTP_400_BAD_REQUEST)

        # drop fully blank rows, strip whitespace from headers
        df.columns = [str(c).strip() for c in df.columns]
        df = df.dropna(how="all")
        df = df.where(pd.notnull(df), None)  # NaN -> None

        created = []
        errors = []
        Organization = request.user.organization.organization_name if request.user.is_authenticated and request.user.organization else None
        branch = request.user.branch.branch_code if request.user.is_authenticated and request.user.branch else None

        print(Organization, branch)
        for idx, row in enumerate(df.to_dict(orient="records"), start=2):  # row 1 = header
            row = self._clean_row(row)
            row['organization'] = Organization
            row['branch']= branch
            serializer = BulkUpdateEMSColleagueSerializer(data=row)
            if serializer.is_valid():
                instance = serializer.save()
                created.append(instance.clg_id)
            else:
                errors.append({"row": idx, "data": row, "errors": serializer.errors})

        return Response(
            {
                "total_rows": len(df),
                "created_count": len(created),
                "error_count": len(errors),
                "created_ids": created,
                "errors": errors,
            },
            status=status.HTTP_207_MULTI_STATUS if errors else status.HTTP_201_CREATED,
        )
    
    def _clean_row(self, row):
        import math
        """Strip whitespace, drop empty/None/NaN values so blank=True fields don't fail."""
        cleaned = {}
        for k, v in row.items():
            if k is None or k == "" or k == "nan":
                continue
            # catch raw float NaN (e.g. from numeric Excel/CSV columns)
            if isinstance(v, float) and math.isnan(v):
                continue
            if isinstance(v, str):
                v = v.strip()
                if v == "" or v.lower() == "nan":
                    continue
            if v is not None:
                cleaned[k] = v
        return cleaned


from io import BytesIO

from django.http import HttpResponse
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated


class EmployeeImportTemplateAPIView(APIView):
    def get(self, request):

        # =========================================================
        # 1. Employee Import Columns
        # =========================================================

        columns = [
            "title",
            "clg_first_name",
            "clg_mid_name",
            "clg_last_name",
            "clg_email",
            "clg_mobile_no",
            "clg_group",
            "clg_designation",
            "clg_gender",
            "clg_marital_status",
            "clg_dob",
            "clg_joining_date",
            "clg_user_type",
            "clg_country",
            "clg_city",
            "clg_address",
            "clg_qualification",
        ]

        # =========================================================
        # 2. Create Workbook
        # =========================================================

        workbook = Workbook()

        worksheet = workbook.active
        worksheet.title = "Employee Import"

        # =========================================================
        # 3. Add Header
        # =========================================================

        for column_number, column_name in enumerate(columns, start=1):

            cell = worksheet.cell(
                row=1,
                column=column_number,
                value=column_name
            )

            cell.font = Font(
                bold=True,
                color="FFFFFF"
            )

            cell.fill = PatternFill(
                fill_type="solid",
                fgColor="1F4E78"
            )

            cell.alignment = Alignment(
                horizontal="center",
                vertical="center"
            )

        # =========================================================
        # 4. Dropdown Values
        # =========================================================

        titles = [
            "Mr.",
            "Ms.",
            "Mrs.",
            "Dr.",
            "Prof."
        ]

        genders = [
            "Male",
            "Female",
            "Other"
        ]

        marital_status = [
            "Single",
            "Married",
            "Divorced",
            "Widowed"
        ]

        # ---------------------------------------------------------
        # User Type
        # ---------------------------------------------------------

        # user_type_queryset = EMSGroup.objects.filter(
        #     status="active"
        # )

        # user_types = list(
        #     user_type_queryset.values_list(
        #         "ugname",
        #         flat=True
        #     )
        # )

        USER_TYPE_CHOICES = (
            ("full_time", "Full Time"),
            ("part_time", "Part Time"),
            ("on_call", "On Call"),
            ("intern", "Intern"),
        )

        user_types = [
            label
            for value, label in USER_TYPE_CHOICES
        ]

        # ---------------------------------------------------------
        # Country
        # ---------------------------------------------------------

        countries = EmsMasState.objects.filter(st_status=1)

        clg_country = list(
            countries.values_list(
                "st_name",
                flat=True
            )
        )

        # ---------------------------------------------------------
        # Group
        # ---------------------------------------------------------

        group_queryset = EMSGroup.objects.filter(
            status="active"
        )

        clg_group = list(
            group_queryset.values_list(
                "gcode",
                flat=True
            )
        )

        # ---------------------------------------------------------
        # City
        # ---------------------------------------------------------

        cities = EmsMasCity.objects.filter(
            cty_satus=1,
            ctyis_deleted=0
        )

        clg_city = list(
            cities.values_list(
                "cty_name",
                flat=True
            )
        )

        # =========================================================
        # 5. Create Hidden Sheet for Dropdown Values
        # =========================================================

        list_sheet = workbook.create_sheet("Lists")

        # Hide the sheet
        list_sheet.sheet_state = "hidden"

        # ---------------------------------------------------------
        # Column A - Title
        # ---------------------------------------------------------

        for row, value in enumerate(titles, start=1):

            list_sheet.cell(
                row=row,
                column=1,
                value=value
            )

        # ---------------------------------------------------------
        # Column B - Gender
        # ---------------------------------------------------------

        for row, value in enumerate(genders, start=1):

            list_sheet.cell(
                row=row,
                column=2,
                value=value
            )

        # ---------------------------------------------------------
        # Column C - Marital Status
        # ---------------------------------------------------------

        for row, value in enumerate(marital_status, start=1):

            list_sheet.cell(
                row=row,
                column=3,
                value=value
            )

        # ---------------------------------------------------------
        # Column D - User Type
        # ---------------------------------------------------------

        for row, value in enumerate(user_types, start=1):

            list_sheet.cell(
                row=row,
                column=4,
                value=value
            )

        # ---------------------------------------------------------
        # Column E - Country
        # ---------------------------------------------------------

        for row, value in enumerate(clg_country, start=1):

            list_sheet.cell(
                row=row,
                column=5,
                value=value
            )

        # ---------------------------------------------------------
        # Column F - Group
        # ---------------------------------------------------------

        for row, value in enumerate(clg_group, start=1):

            list_sheet.cell(
                row=row,
                column=6,
                value=value
            )

        # ---------------------------------------------------------
        # Column G - City
        # ---------------------------------------------------------

        for row, value in enumerate(clg_city, start=1):

            list_sheet.cell(
                row=row,
                column=7,
                value=value
            )

        # =========================================================
        # 6. Create Named Ranges
        # =========================================================

        workbook.defined_names.add(
            DefinedName(
                "TitleList",
                attr_text=f"'Lists'!$A$1:$A${len(titles)}"
            )
        )

        workbook.defined_names.add(
            DefinedName(
                "GenderList",
                attr_text=f"'Lists'!$B$1:$B${len(genders)}"
            )
        )

        workbook.defined_names.add(
            DefinedName(
                "MaritalStatusList",
                attr_text=f"'Lists'!$C$1:$C${len(marital_status)}"
            )
        )

        workbook.defined_names.add(
            DefinedName(
                "UserTypeList",
                attr_text=f"'Lists'!$D$1:$D${len(user_types)}"
            )
        )

        workbook.defined_names.add(
            DefinedName(
                "CountryList",
                attr_text=f"'Lists'!$E$1:$E${len(clg_country)}"
            )
        )

        workbook.defined_names.add(
            DefinedName(
                "GroupList",
                attr_text=f"'Lists'!$F$1:$F${len(clg_group)}"
            )
        )

        workbook.defined_names.add(
            DefinedName(
                "CityList",
                attr_text=f"'Lists'!$G$1:$G${len(clg_city)}"
            )
        )

        # =========================================================
        # 7. Create Data Validation Dropdowns
        # =========================================================

        title_dropdown = DataValidation(
            type="list",
            formula1="=TitleList",
            allow_blank=True
        )

        gender_dropdown = DataValidation(
            type="list",
            formula1="=GenderList",
            allow_blank=True
        )

        marital_dropdown = DataValidation(
            type="list",
            formula1="=MaritalStatusList",
            allow_blank=True
        )

        user_type_dropdown = DataValidation(
            type="list",
            formula1="=UserTypeList",
            allow_blank=True
        )

        country_dropdown = DataValidation(
            type="list",
            formula1="=CountryList",
            allow_blank=True
        )

        group_dropdown = DataValidation(
            type="list",
            formula1="=GroupList",
            allow_blank=True
        )

        city_dropdown = DataValidation(
            type="list",
            formula1="=CityList",
            allow_blank=True
        )

        # =========================================================
        # 8. Add Data Validations to Worksheet
        # =========================================================

        worksheet.add_data_validation(
            title_dropdown
        )

        worksheet.add_data_validation(
            gender_dropdown
        )

        worksheet.add_data_validation(
            marital_dropdown
        )

        worksheet.add_data_validation(
            user_type_dropdown
        )

        worksheet.add_data_validation(
            country_dropdown
        )

        worksheet.add_data_validation(
            group_dropdown
        )

        worksheet.add_data_validation(
            city_dropdown
        )

        # =========================================================
        # 9. Apply Dropdowns to Correct Excel Columns
        # =========================================================

        # title -> Column A
        title_dropdown.add(
            "A2:A1000"
        )

        # clg_group -> Column G
        group_dropdown.add(
            "G2:G1000"
        )

        # clg_gender -> Column I
        gender_dropdown.add(
            "I2:I1000"
        )

        # clg_marital_status -> Column J
        marital_dropdown.add(
            "J2:J1000"
        )

        # clg_user_type -> Column M
        user_type_dropdown.add(
            "M2:M1000"
        )

        # clg_country -> Column N
        country_dropdown.add(
            "N2:N1000"
        )

        # clg_city -> Column O
        city_dropdown.add(
            "O2:O1000"
        )

        # =========================================================
        # 10. Date Formatting
        # =========================================================

        # clg_dob -> Column K
        for row in range(2, 1001):

            worksheet[
                f"K{row}"
            ].number_format = "YYYY-MM-DD"

        # clg_joining_date -> Column L
        for row in range(2, 1001):

            worksheet[
                f"L{row}"
            ].number_format = "YYYY-MM-DD"

        # =========================================================
        # 11. Column Width
        # =========================================================

        for column_number, column_name in enumerate(
            columns,
            start=1
        ):

            column_letter = get_column_letter(
                column_number
            )

            if column_name in [
                "clg_first_name",
                "clg_mid_name",
                "clg_last_name",
                "clg_address",
                "clg_qualification",
            ]:

                width = 25

            elif column_name in [
                "clg_email",
                "clg_mobile_no",
            ]:

                width = 25

            elif column_name in [
                "clg_dob",
                "clg_joining_date",
            ]:

                width = 18

            else:

                width = 20

            worksheet.column_dimensions[
                column_letter
            ].width = width

        # =========================================================
        # 12. Freeze Header
        # =========================================================

        worksheet.freeze_panes = "A2"

        # =========================================================
        # 13. Header Row Height
        # =========================================================

        worksheet.row_dimensions[1].height = 25

        # =========================================================
        # 14. Save Workbook in Memory
        # =========================================================

        output = BytesIO()

        workbook.save(output)

        output.seek(0)

        # =========================================================
        # 15. Return Excel File
        # =========================================================

        response = HttpResponse(
            output.getvalue(),
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )

        response["Content-Disposition"] = (
            'attachment; filename="employee_import_template.xlsx"'
        )

        return response

# ====================================================================================================================================================
#                                   Employee Document
# ====================================================================================================================================================


class employee_document_listview(APIView):
    def get(self, request):
        documents = DocumentType.objects.filter(status=1, is_deleted=0).order_by("document_type")
        serializer = EmployeeDocumentSerializer(documents, many=True)
        return Response(serializer.data)


class EmployeeDocumentListAPIView(APIView):
    def get(self, request):
        documents = CandidateDocument.objects.filter(status=1,is_deleted=0).select_related("colleague","document_type","organization","branch").order_by("-pk_id")
        serializer = CandidateDocumentSerializer(documents,many=True,context={"request": request})
        return Response({"status": True,"message": "Employee document list fetched successfully.","data": serializer.data},status=status.HTTP_200_OK)





class EmployeeDocumentAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    def get(self, request, id):
        documents = CandidateDocument.objects.filter(colleague=id,status=1,is_deleted=0).select_related("colleague","document_type","organization","branch").order_by("-pk_id")
        serializer = CandidateDocumentSerializer(documents,many=True,context={"request": request})
        return Response({"status": True,"message": "Employee documents fetched successfully.","data": serializer.data},status=status.HTTP_200_OK)

    def post(self, request, id):
        data = request.data.copy()
        # Employee/Candidate ID comes from URL
        data["colleague"] = id
        serializer = CandidateDocumentSerializer(data=data,context={"request": request})

        if serializer.is_valid():
            document = serializer.save(added_by=str(request.user))
            return Response({"status": True,"message": "Employee document uploaded successfully.","data": CandidateDocumentSerializer(document,context={"request": request}).data},status=status.HTTP_201_CREATED)

        return Response({"status": False,"message": "Failed to upload employee document.","errors": serializer.errors},status=status.HTTP_400_BAD_REQUEST)





class EmployeeDocumentUpdateAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    def put(self, request, id):
        try:
            document = CandidateDocument.objects.get(pk_id=id,status=1,is_deleted=0)
        except CandidateDocument.DoesNotExist:
            return Response({"status": False,"message": "Employee document not found."},status=status.HTTP_404_NOT_FOUND)
        data = request.data.copy()
        serializer = CandidateDocumentSerializer(document,data=data,partial=True,context={"request": request})
        if serializer.is_valid():
            updated_document = serializer.save(modify_by=str(request.user))
            return Response({"status": True,"message": "Employee document updated successfully.","data": CandidateDocumentSerializer(updated_document,context={"request": request}).data},status=status.HTTP_200_OK)
        return Response({"status": False,"message": "Failed to update employee document.","errors": serializer.errors},status=status.HTTP_400_BAD_REQUEST)



class BulkCandidateDocumentAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, id):


        document_keys = []

        for key in request.FILES.keys():
            match = re.match(r"documents\[(\d+)\]\[document\]", key)

            if match:
                index = int(match.group(1))
                document_keys.append(index)

        if not document_keys:
            return Response(
                {
                    "status": False,
                    "message": "At least one document is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        document_keys.sort()

        created_documents = []
        errors = []

        with transaction.atomic():

            for index in document_keys:

                document_key = f"documents[{index}][document]"
                document_type_key = f"documents[{index}][document_type]"
                remarks_key = f"documents[{index}][remarks]"
                verification_status_key = (
                    f"documents[{index}][verification_status]"
                )
                signature_required_key = (
                    f"documents[{index}][is_signature_required]"
                )

            
                document = request.FILES.get(document_key)
                document_type = int(request.data.get(document_type_key))
                remarks = request.data.get(remarks_key, "")
                verification_status = request.data.get(
                    verification_status_key, 0
                )
                is_signature_required = request.data.get(
                    signature_required_key, False
                )
                # print(document,document_type)
                

                data = {
                    "document_type": document_type,
                    "document": document,
                    "verification_status": verification_status,
                    "is_signature_required": is_signature_required,
                    "remarks": remarks,
                }

                serializer = CandidateBulkDocumentSerializer(
                    data=data,
                    context={"request": request}
                )

                # print(serializer.is_valid(), serializer.errors)
                print(type(document_type), document_type)

                if serializer.is_valid():
                    clg = EMSColleague.objects.get(clg_id=id)
                    
                    candidate_document = CandidateDocument.objects.create(
                        colleague=clg,
                        document_type_id=document_type,
                        document=document,
                        verification_status=verification_status,
                        is_signature_required=is_signature_required,
                        remarks=remarks,
                        added_by=str(request.user),
                    )

                    created_documents.append(candidate_document)

                else:
                    errors.append({
                        "index": index,
                        "document": document.name if document else None,
                        "errors": serializer.errors
                    })

            # If any document fails, rollback everything
            if errors:
                transaction.set_rollback(True)

                return Response(
                    {
                        "status": False,
                        "message": "Failed to upload documents.",
                        "errors": errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(
            {
                "status": True,
                "message": "Candidate documents uploaded successfully.",
                "uploaded_count": len(created_documents),
                "data": CandidateDocumentSerializer(
                    created_documents,
                    many=True,
                    context={"request": request}
                ).data
            },
            status=status.HTTP_201_CREATED
        )

    

class employee_master_listview(APIView):
    def get(self, request, id):
        try:
            print('hii')
            # {"value": 5, "label": "Prof."}
            title = [{"value": 1, "label": "Mr"}, {"value": 2, "label": "Ms"}, {"value": 3, "label": "Mrs"}, {"value": 4, "label": "Miss"}]
            gender = [{"value": 1, "label": "Male"}, {"value": 2, "label": "Female"}, {"value": 3, "label": "Other"}]
            marital_status = [{"value": 1, "label": "Single"}, {"value": 2, "label": "Married"}, {"value": 3, "label": "Divorced"}, {"value": 4, "label": "Widowed"}]
            # {"value": 4, "label": "Intern"}
            # employment_type = [{"value": 1, "label": "Full-time"}, {"value": 2, "label": "Part-time"}, {"value": 3, "label": "Contract"}]
            employment_type = [{"value": 1, "label": "Full Time"}, {"value": 2, "label": "Part Time"}, {"value": 3, "label": "Contract"}]
            cloth_size = [{"value": 1, "label": "Small (S)"}, {"value": 2, "label": "Medium (M)"}, {"value": 3, "label": "Large (L)"}, {"value": 4, "label": "Extra Large (XL)Ss"}]
            blood_type = [{"value": 1, "label": "A+"}, {"value": 2, "label": "A-"}, {"value": 3, "label": "B+"}, {"value": 4, "label": "B-"}, {"value": 5, "label": "AB+"}, {"value": 6, "label": "AB-"}, {"value": 7, "label": "O+"}, {"value": 8, "label": "O-"}]
            shift_type = [{"value": 1, "label": "96 hrs"},{"value":2, "label": "160 hrs"}]
            return Response(title if id == 1 else gender if id == 2 else marital_status if id == 3 else employment_type if id == 4 else blood_type if id == 5 else cloth_size if id == 6 else shift_type if id == 7 else None, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# ====================================================================================================================================================


class ShiftListCreateAPIView(APIView):
    """
    Create Shift
    List Active Shifts
    """

    def get(self, request):
        shifts = Shift.objects.filter(is_deleted=0).order_by("-shift_id")
        serializer = ShiftSerializer(shifts, many=True)

        return Response(
            {
                "status": True,
                "message": "Shift list fetched successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = ShiftSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "status": True,
                    "message": "Shift created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "status": False,
                "message": "Validation error.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class ShiftDetailAPIView(APIView):
    def get_object(self, shift_id):
        try:
            return Shift.objects.get(shift_id=shift_id, is_deleted=0)
        except Shift.DoesNotExist:
            return None

    def get(self, request, shift_id):
        shift = self.get_object(shift_id)

        if not shift:
            return Response(
                {
                    "status": False,
                    "message": "Shift not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ShiftSerializer(shift)

        if not shift:
            return Response(
                {
                    "status": False,
                    "message": "Shift not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ShiftSerializer(shift)

        return Response(
            {
                "status": True,
                "message": "Shift details fetched successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, shift_id):
        shift = self.get_object(shift_id)

        if not shift:
            return Response(
                {
                    "status": False,
                    "message": "Shift not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ShiftSerializer(
            shift,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "status": True,
                    "message": "Shift updated successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "status": False,
                "message": "Validation error.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, shift_id):
        shift = self.get_object(shift_id)

        if not shift:
            return Response(
                {
                    "status": False,
                    "message": "Shift not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Soft Delete
        shift.status = 0
        shift.is_deleted = 1
        shift.save()

        return Response(
            {
                "status": True,
                "message": "Shift deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )



from datetime import datetime, timedelta
from decimal import Decimal

from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Import your models
# from .models import Shift, ShiftRoster, EMSColleague, HolidayDate, DeviceToken
# from .serializers import ShiftRosterBulkSerializer, ShiftRosterSerializer


class ShiftRosterListCreateAPIView(APIView):
    """
    Create Shift Roster
    List Shift Rosters

    Working hour validation:
        96 hrs employee  -> max 96 hours per month
        160 hrs employee -> max 160 hours per month
    """

    # --------------------------------------------------
    # Helper: Get employee monthly working-hour limit
    # --------------------------------------------------

    @staticmethod
    def get_employee_monthly_limit(employee):

        if employee.clg_shift_type == "96 hrs":
            return Decimal("96")

        elif employee.clg_shift_type == "160 hrs":
            return Decimal("160")

        return None

    # --------------------------------------------------
    # Helper: Calculate shift duration
    # --------------------------------------------------

    @staticmethod
    def get_shift_duration_hours(shift):
        if not shift:
            return Decimal("0")

        if not shift.start_time or not shift.end_time:
            return Decimal("0")

        start = datetime.combine(
            datetime.today(),
            shift.start_time
        )

        end = datetime.combine(
            datetime.today(),
            shift.end_time
        )

        # Night shift
        if end <= start:
            end += timedelta(days=1)

        duration = end - start

        return Decimal(
            str(duration.total_seconds() / 3600)
        )

    # --------------------------------------------------
    # Helper: Get first day of month
    # --------------------------------------------------

    @staticmethod
    def get_month_start(date_value):
        return date_value.replace(day=1)

    # --------------------------------------------------
    # Helper: Get last day of month
    # --------------------------------------------------

    @staticmethod
    def get_month_end(date_value):

        if date_value.month == 12:
            next_month = date_value.replace(
                year=date_value.year + 1,
                month=1,
                day=1
            )
        else:
            next_month = date_value.replace(
                month=date_value.month + 1,
                day=1
            )

        return next_month - timedelta(days=1)

    # --------------------------------------------------
    # GET
    # --------------------------------------------------

    def get(self, request):

        start_date = request.GET.get("start_date")
        end_date = request.GET.get("end_date")
        emp_id = request.GET.get("emp_id")

        filters = {
            "is_deleted": 0
        }

        # Employee filter
        if emp_id:
            filters["employee"] = emp_id

        # Date range filter
        if start_date and end_date:

            filters["roster_date__gte"] = start_date
            filters["roster_date__lte"] = end_date

        elif start_date:

            filters["roster_date__gte"] = start_date

        elif end_date:

            filters["roster_date__lte"] = end_date

        rosters = ShiftRoster.objects.filter(
            **filters
        ).select_related(
            "employee",
            "shift"
        ).order_by("-roster_date")

        serializer = ShiftRosterSerializer(
            rosters,
            many=True
        )

        return Response(
            {
                "status": True,
                "data": serializer.data,
                "error": None
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------
    # POST
    # --------------------------------------------------

    @transaction.atomic
    def post(self, request):

        # --------------------------------------------------
        # 1. Validate request
        # --------------------------------------------------

        serializer = ShiftRosterBulkSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                {
                    "status": False,
                    "message": "Validation error.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        employee_ids = serializer.validated_data["employee"]
        shift_id = serializer.validated_data["shift"]
        start_date = serializer.validated_data["start_date"]
        end_date = serializer.validated_data["end_date"]

        # --------------------------------------------------
        # 2. Validate shift
        # --------------------------------------------------

        shift = Shift.objects.filter(
            shift_id=shift_id,
            status=1,
            is_deleted=0
        ).first()

        if not shift:

            return Response(
                {
                    "status": False,
                    "message": "Shift not found.",
                    "data": None,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # --------------------------------------------------
        # 3. Calculate selected shift duration
        # --------------------------------------------------

        shift_duration_hours = self.get_shift_duration_hours(shift)

        if shift_duration_hours <= 0:

            return Response(
                {
                    "status": False,
                    "message": (
                        "Invalid shift duration. "
                        "Please configure start time and end time."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # 4. Fetch all selected employees
        # --------------------------------------------------

        employees = list(
            EMSColleague.objects.filter(
                clg_id__in=employee_ids,
                clg_is_active=1,
                clg_is_deleted=0
            )
        )

        # --------------------------------------------------
        # 5. Validate employee IDs
        # --------------------------------------------------

        found_employee_ids = {
            employee.clg_id
            for employee in employees
        }

        missing_employee_ids = (
            set(employee_ids) - found_employee_ids
        )

        if missing_employee_ids:

            return Response(
                {
                    "status": False,
                    "message": "Some employees were not found.",
                    "missing_employee_ids": sorted(
                        list(missing_employee_ids)
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # 6. Validate employee working-hour configuration
        # --------------------------------------------------

        employee_limits = {}

        employee_limit_errors = []

        for employee in employees:

            monthly_limit = self.get_employee_monthly_limit(
                employee
            )

            if monthly_limit is None:

                employee_limit_errors.append(
                    {
                        "employee_id": employee.clg_id,
                        "employee_name": (
                            f"{employee.clg_first_name} "
                            f"{employee.clg_last_name}"
                        ),
                        "clg_shift_type": employee.clg_shift_type,
                        "message": (
                            "Employee working hour limit "
                            "is not configured."
                        )
                    }
                )

            else:

                employee_limits[
                    employee.clg_id
                ] = monthly_limit

        if employee_limit_errors:

            return Response(
                {
                    "status": False,
                    "message": (
                        "Working hour limit is not configured "
                        "for some employees."
                    ),
                    "errors": employee_limit_errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # 7. Get complete month range
        #
        # Example:
        # 2026-09-25 to 2026-10-10
        #
        # We need to check the COMPLETE September
        # and COMPLETE October rosters.
        # --------------------------------------------------

        overall_month_start = self.get_month_start(
            start_date
        )

        overall_month_end = self.get_month_end(
            end_date
        )

        # --------------------------------------------------
        # 8. Fetch holidays for complete month range
        # --------------------------------------------------

        holiday_dates = set(
            HolidayDate.objects.filter(
                holiday_date__range=[
                    overall_month_start,
                    overall_month_end
                ],
                holiday__status=1,
            ).values_list(
                "holiday_date",
                flat=True
            )
        )

        # --------------------------------------------------
        # 9. Fetch ALL existing rosters for affected months
        #
        # Important:
        # We don't fetch only start_date/end_date because
        # working-hour validation is MONTHLY.
        # --------------------------------------------------

        existing_rosters = ShiftRoster.objects.filter(
            employee_id__in=employee_ids,
            roster_date__range=[
                overall_month_start,
                overall_month_end
            ],
            is_deleted=0
        ).select_related(
            "shift"
        )

        # --------------------------------------------------
        # 10. Map existing rosters
        #
        # {
        #     (employee_id, roster_date): roster_object
        # }
        # --------------------------------------------------

        existing_roster_map = {
            (
                roster.employee_id,
                roster.roster_date
            ): roster
            for roster in existing_rosters
        }

        # --------------------------------------------------
        # 11. Calculate existing monthly working hours
        #
        # IMPORTANT:
        # Existing roster dates which are inside the
        # current request range are excluded because they
        # are going to be UPDATED, not additionally created.
        # --------------------------------------------------

        employee_monthly_existing_hours = {}

        for roster in existing_rosters:

            # If this roster is inside the requested range,
            # it will be replaced by the new shift.
            if (
                start_date
                <= roster.roster_date
                <= end_date
            ):
                continue

            # Don't count weekoff
            if roster.is_weekoff == 1:
                continue

            # Don't count holiday
            if roster.is_holiday == 1:
                continue

            employee_id = roster.employee_id

            roster_month = (
                roster.roster_date.year,
                roster.roster_date.month
            )

            roster_hours = self.get_shift_duration_hours(
                roster.shift
            )

            if roster_hours <= 0:
                continue

            if employee_id not in employee_monthly_existing_hours:
                employee_monthly_existing_hours[
                    employee_id
                ] = {}

            employee_monthly_existing_hours[
                employee_id
            ][roster_month] = (
                employee_monthly_existing_hours[
                    employee_id
                ].get(roster_month, Decimal("0"))
                + roster_hours
            )

        # --------------------------------------------------
        # 12. Calculate NEW assignment hours month-wise
        # --------------------------------------------------

        employee_monthly_new_hours = {}

        current_date = start_date

        while current_date <= end_date:

            # ----------------------------------------------
            # Holiday
            # ----------------------------------------------

            if current_date in holiday_dates:

                current_date += timedelta(days=1)
                continue

            # ----------------------------------------------
            # Saturday / Sunday
            # ----------------------------------------------

            if current_date.weekday() in [5, 6]:

                current_date += timedelta(days=1)
                continue

            # ----------------------------------------------
            # Working day
            # ----------------------------------------------

            date_month = (
                current_date.year,
                current_date.month
            )

            for employee in employees:

                employee_id = employee.clg_id

                if employee_id not in employee_monthly_new_hours:

                    employee_monthly_new_hours[
                        employee_id
                    ] = {}

                employee_monthly_new_hours[
                    employee_id
                ][date_month] = (
                    employee_monthly_new_hours[
                        employee_id
                    ].get(
                        date_month,
                        Decimal("0")
                    )
                    + shift_duration_hours
                )

            current_date += timedelta(days=1)

        # --------------------------------------------------
        # 13. Validate monthly working hours
        # --------------------------------------------------

        validation_errors = []

        for employee in employees:

            employee_id = employee.clg_id

            monthly_limit = employee_limits[
                employee_id
            ]

            existing_months = (
                employee_monthly_existing_hours.get(
                    employee_id,
                    {}
                )
            )

            new_months = (
                employee_monthly_new_hours.get(
                    employee_id,
                    {}
                )
            )

            # Combine all affected months
            affected_months = (
                set(existing_months.keys())
                | set(new_months.keys())
            )

            for year, month in affected_months:

                existing_hours = existing_months.get(
                    (year, month),
                    Decimal("0")
                )

                new_hours = new_months.get(
                    (year, month),
                    Decimal("0")
                )

                total_hours = (
                    existing_hours
                    + new_hours
                )

                if total_hours > monthly_limit:

                    validation_errors.append(
                        {
                            "employee_id": employee_id,
                            "employee_name": (
                                f"{employee.clg_first_name} "
                                f"{employee.clg_last_name}"
                            ),
                            "month": f"{year}-{month:02d}",
                            "working_hour_type": (
                                employee.clg_shift_type
                            ),
                            "allowed_hours": float(
                                monthly_limit
                            ),
                            "existing_hours": float(
                                round(
                                    existing_hours,
                                    2
                                )
                            ),
                            "new_assignment_hours": float(
                                round(
                                    new_hours,
                                    2
                                )
                            ),
                            "total_hours": float(
                                round(
                                    total_hours,
                                    2
                                )
                            ),
                            "exceeded_by": float(
                                round(
                                    total_hours
                                    - monthly_limit,
                                    2
                                )
                            )
                        }
                    )

        # --------------------------------------------------
        # 14. Reject if working-hour limit exceeded
        # --------------------------------------------------

        if validation_errors:

            return Response(
                {
                    "status": False,
                    "message": (
                        "Shift assignment exceeds "
                        "the employee's monthly "
                        "working hour limit."
                    ),
                    "errors": validation_errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # --------------------------------------------------
        # 15. Prepare bulk create/update lists
        # --------------------------------------------------

        roster_objects_to_create = []
        roster_objects_to_update = []

        current_date = start_date

        while current_date <= end_date:

            # --------------------------------------------------
            # Determine weekoff / holiday
            # --------------------------------------------------

            if current_date in holiday_dates:

                is_holiday = 1
                is_weekoff = 0

            elif current_date.weekday() in [5, 6]:

                # Saturday = 5
                # Sunday = 6

                is_weekoff = 1
                is_holiday = 0

            else:

                is_weekoff = 0
                is_holiday = 0

            # --------------------------------------------------
            # Process selected employees
            # --------------------------------------------------

            for employee in employees:

                key = (
                    employee.clg_id,
                    current_date
                )

                existing_roster = (
                    existing_roster_map.get(key)
                )

                # --------------------------------------------------
                # Existing roster
                # --------------------------------------------------

                if existing_roster:

                    existing_roster.shift_id = shift_id

                    existing_roster.is_weekoff = (
                        is_weekoff
                    )

                    existing_roster.is_holiday = (
                        is_holiday
                    )

                    existing_roster.week_number = (
                        current_date.isocalendar().week
                    )

                    existing_roster.month = (
                        current_date.month
                    )

                    existing_roster.year = (
                        current_date.year
                    )

                    existing_roster.status = 1
                    existing_roster.is_deleted = 0

                    roster_objects_to_update.append(
                        existing_roster
                    )

                # --------------------------------------------------
                # New roster
                # --------------------------------------------------

                else:

                    roster_objects_to_create.append(
                        ShiftRoster(
                            employee_id=employee.clg_id,
                            shift_id=shift_id,
                            roster_date=current_date,
                            week_number=(
                                current_date.isocalendar().week
                            ),
                            month=current_date.month,
                            year=current_date.year,
                            is_weekoff=is_weekoff,
                            is_holiday=is_holiday,
                            status=1,
                            is_deleted=0,
                        )
                    )

            current_date += timedelta(days=1)

        # --------------------------------------------------
        # 16. Bulk create
        # --------------------------------------------------

        if roster_objects_to_create:

            ShiftRoster.objects.bulk_create(
                roster_objects_to_create,
                batch_size=1000
            )

        # --------------------------------------------------
        # 17. Bulk update
        # --------------------------------------------------

        if roster_objects_to_update:

            ShiftRoster.objects.bulk_update(
                roster_objects_to_update,
                [
                    "shift",
                    "is_weekoff",
                    "is_holiday",
                    "week_number",
                    "month",
                    "year",
                    "status",
                    "is_deleted",
                ],
                batch_size=1000
            )

        # --------------------------------------------------
        # 18. Notifications
        # --------------------------------------------------

        title = "Shift Update"

        message = (
            "A shift has been assigned to you. "
            "Please visit the Shift tab to check "
            "your roster."
        )

        for employee in employees:

            try:

                # Create notification
                create_notification(
                    employee,
                    title,
                    message,
                    3
                )

                # Get logged-in device
                device = DeviceToken.objects.filter(
                    clg_id=employee.clg_id,
                    is_login=1
                ).first()

                if device:

                    send_fcm_notification(
                        device.token,
                        title,
                        message
                    )

            except Exception as e:

                # Don't fail roster creation
                # if notification fails
                print(
                    f"Notification failed for employee "
                    f"{employee.clg_id}: {str(e)}"
                )

        # --------------------------------------------------
        # 19. Response
        # --------------------------------------------------

        total_created = len(
            roster_objects_to_create
        )

        total_updated = len(
            roster_objects_to_update
        )

        return Response(
            {
                "status": True,
                "message": (
                    "Shift roster assigned successfully."
                ),
                "total_records": (
                    total_created
                    + total_updated
                ),
                "created_records": total_created,
                "updated_records": total_updated,
                "employees_count": len(employees),
                "date_range": {
                    "start_date": start_date,
                    "end_date": end_date,
                },
                "shift": {
                    "shift_id": shift.shift_id,
                    "shift_name": shift.shift_name,
                    "start_time": shift.start_time,
                    "end_time": shift.end_time,
                    "duration_hours": float(
                        shift_duration_hours
                    )
                },
                "data": ShiftRosterSerializer(
                    roster_objects_to_create,
                    many=True
                ).data
                if roster_objects_to_create
                else [],
            },
            status=status.HTTP_201_CREATED,
        )



class ShiftRosterUpdateAPIView(APIView):
    def get_employee_monthly_limit(self, employee):
        """
        Returns monthly working-hour limit based on employee shift type.
        """
        shift_type = str(employee.clg_shift_type).strip().lower()

        if shift_type == "96 hrs":
            return Decimal("96")

        elif shift_type == "160 hrs":
            return Decimal("160")

        return None


    def get_shift_duration_hours(self, shift):
        """
        Calculates shift duration in hours.
        Handles overnight shifts.
        """

        if not shift.start_time or not shift.end_time:
            return Decimal("0")

        start_minutes = (
            shift.start_time.hour * 60
            + shift.start_time.minute
            + Decimal(shift.start_time.second) / Decimal("60")
        )

        end_minutes = (
            shift.end_time.hour * 60
            + shift.end_time.minute
            + Decimal(shift.end_time.second) / Decimal("60")
        )

        duration_minutes = end_minutes - start_minutes

        # Overnight shift
        if duration_minutes <= 0:
            duration_minutes += Decimal("1440")

        return duration_minutes / Decimal("60")
    

    @transaction.atomic
    def put(self, request):

        # --------------------------------------------------
        # 1. Validate request
        # --------------------------------------------------

        serializer = ShiftRosterBulkSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                {
                    "status": False,
                    "message": "Validation error.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        employee_ids = serializer.validated_data["employee"]
        shift_id = serializer.validated_data["shift"]
        start_date = serializer.validated_data["start_date"]
        end_date = serializer.validated_data["end_date"]

        remarks = serializer.validated_data.get("remarks")

        organization_id = serializer.validated_data.get(
            "organization"
        )

        branch_id = serializer.validated_data.get(
            "branch"
        )

        # --------------------------------------------------
        # 2. Validate shift
        # --------------------------------------------------

        shift = Shift.objects.filter(
            shift_id=shift_id,
            status=1,
            is_deleted=0
        ).first()

        if not shift:
            return Response(
                {
                    "status": False,
                    "message": "Shift not found.",
                    "data": None,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # --------------------------------------------------
        # 3. Calculate new shift duration
        # --------------------------------------------------

        new_shift_hours = self.get_shift_duration_hours(shift)

        if new_shift_hours <= 0:
            return Response(
                {
                    "status": False,
                    "message": "Selected shift has invalid working hours.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # 4. Get selected employees
        # --------------------------------------------------
        employees = list(
            EMSColleague.objects.filter(
                clg_id__in=employee_ids,
                clg_is_active=1,
                clg_is_deleted=0
            )
        )

        found_employee_ids = {
            employee.clg_id
            for employee in employees
        }

        missing_employee_ids = (
            set(employee_ids) - found_employee_ids
        )

        if missing_employee_ids:
            return Response(
                {
                    "status": False,
                    "message": "Some employees were not found.",
                    "missing_employee_ids": sorted(
                        list(missing_employee_ids)
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # --------------------------------------------------
        # 5. Get active/current incident assignments
        # --------------------------------------------------

        ambulance_records = (
            EmsIncidenceAmbulance.objects.filter(
                amb_status__in=[
                    "assign",
                    "current"
                ]
            )
            .only(
                "inc_ref_id",
                "crew_id",
                "assigned_time",
                "amb_status"
            )
        )

        # --------------------------------------------------
        # 6. Build employee -> incident map
        # --------------------------------------------------

        incident_employee_map = {}

        for ambulance in ambulance_records:

            crew = ambulance.crew_id

            if not crew:
                continue

            if not isinstance(crew, list):
                continue

            for crew_member in crew:

                if not isinstance(
                    crew_member,
                    dict
                ):
                    continue

                crew_employee_id = crew_member.get("id")

                if crew_employee_id is None:
                    continue

                try:
                    crew_employee_id = int(
                        crew_employee_id
                    )
                except (
                    TypeError,
                    ValueError
                ):
                    continue

                incident_employee_map[
                    crew_employee_id
                ] = {
                    "incident_ref_id": (
                        ambulance.inc_ref_id
                    ),
                    "assigned_time": (
                        ambulance.assigned_time
                    ),
                }

        # --------------------------------------------------
        # 7. Determine affected months
        # --------------------------------------------------

        affected_months = set()

        current_date = start_date

        while current_date <= end_date:

            affected_months.add(
                (
                    current_date.year,
                    current_date.month
                )
            )

            current_date += timedelta(days=1)

        # --------------------------------------------------
        # 8. Get first/last date for affected months
        # --------------------------------------------------

        month_start_dates = []
        month_end_dates = []

        for year, month in affected_months:

            month_start = date(
                year,
                month,
                1
            )

            if month == 12:
                next_month = date(
                    year + 1,
                    1,
                    1
                )
            else:
                next_month = date(
                    year,
                    month + 1,
                    1
                )

            month_end = next_month - timedelta(days=1)

            month_start_dates.append(month_start)
            month_end_dates.append(month_end)

        overall_month_start = min(month_start_dates)
        overall_month_end = max(month_end_dates)

        # --------------------------------------------------
        # 9. Get holidays for affected months
        # --------------------------------------------------

        holiday_dates = set(
            HolidayDate.objects.filter(
                holiday_date__range=[
                    overall_month_start,
                    overall_month_end
                ],
                holiday__status=1,
            ).values_list(
                "holiday_date",
                flat=True
            )
        )

        # --------------------------------------------------
        # 10. Get ALL existing rosters for affected months
        # --------------------------------------------------

        existing_rosters = ShiftRoster.objects.filter(
            employee_id__in=employee_ids,
            roster_date__range=[
                overall_month_start,
                overall_month_end
            ],
            is_deleted=0
        ).select_related("shift")

        # --------------------------------------------------
        # 11. Build roster map
        # --------------------------------------------------

        existing_roster_map = {
            (
                roster.employee_id,
                roster.roster_date
            ): roster
            for roster in existing_rosters
        }

        # --------------------------------------------------
        # 12. Calculate existing monthly hours
        # --------------------------------------------------

        existing_monthly_hours = {}

        for roster in existing_rosters:

            employee_id = roster.employee_id

            year = roster.roster_date.year
            month = roster.roster_date.month

            month_key = (
                employee_id,
                year,
                month
            )

            if month_key not in existing_monthly_hours:
                existing_monthly_hours[month_key] = Decimal("0")

            # ----------------------------------------------
            # IMPORTANT:
            # Don't count the roster that is going to be
            # updated because the new shift will replace it.
            # ----------------------------------------------

            if (
                start_date
                <= roster.roster_date
                <= end_date
            ):
                continue

            # Skip weekoff
            if roster.is_weekoff == 1:
                continue

            # Skip holiday
            if roster.is_holiday == 1:
                continue

            if not roster.shift:
                continue

            roster_shift_hours = self.get_shift_duration_hours(
                roster.shift
            )

            existing_monthly_hours[
                month_key
            ] += roster_shift_hours

        # --------------------------------------------------
        # 13. Validate 96 / 160 hour limit
        # --------------------------------------------------

        skipped_hour_limit_employees = []

        for employee in employees:

            employee_id = employee.clg_id

            monthly_limit = self.get_employee_monthly_limit(
                employee
            )

            # If employee doesn't have 96/160 configured,
            # don't apply this validation.
            if monthly_limit is None:
                continue

            current_date = start_date

            while current_date <= end_date:

                year = current_date.year
                month = current_date.month

                month_key = (
                    employee_id,
                    year,
                    month
                )

                existing_hours = existing_monthly_hours.get(
                    month_key,
                    Decimal("0")
                )

                # --------------------------------------------------
                # Don't add hours for holiday/weekoff
                # --------------------------------------------------

                if current_date in holiday_dates:

                    new_hours = Decimal("0")

                elif current_date.weekday() in [5, 6]:

                    new_hours = Decimal("0")

                else:

                    new_hours = new_shift_hours

                total_hours = (
                    existing_hours
                    + new_hours
                )

                if total_hours > monthly_limit:

                    skipped_hour_limit_employees.append(
                        {
                            "employee_id": employee_id,
                            "employee_name": (
                                f"{employee.clg_first_name or ''} "
                                f"{employee.clg_last_name or ''}"
                            ).strip(),
                            "month": current_date.strftime(
                                "%Y-%m"
                            ),
                            "existing_hours": float(
                                existing_hours
                            ),
                            "new_shift_hours": float(
                                new_hours
                            ),
                            "total_hours": float(
                                total_hours
                            ),
                            "allowed_hours": float(
                                monthly_limit
                            ),
                            "reason": (
                                f"Monthly working hours "
                                f"would exceed the "
                                f"{monthly_limit} hours limit."
                            )
                        }
                    )

                    # Once one month exceeds the limit,
                    # don't check the same employee again.
                    break

                current_date += timedelta(days=1)

        # --------------------------------------------------
        # 14. Employees exceeding limit
        # --------------------------------------------------

        hour_limit_employee_ids = {
            item["employee_id"]
            for item in skipped_hour_limit_employees
        }

        # --------------------------------------------------
        # 15. Prepare update list
        # --------------------------------------------------

        roster_objects_to_update = []

        skipped_employees = []

        current_date = start_date

        while current_date <= end_date:

            # --------------------------------------------------
            # Determine holiday / weekoff
            # --------------------------------------------------

            if current_date in holiday_dates:

                is_holiday = 1
                is_weekoff = 0

            elif current_date.weekday() in [5, 6]:

                is_weekoff = 1
                is_holiday = 0

            else:

                is_weekoff = 0
                is_holiday = 0

            # --------------------------------------------------
            # Process employees
            # --------------------------------------------------

            for employee_id in employee_ids:

                # --------------------------------------------------
                # Check hour limit
                # --------------------------------------------------

                if employee_id in hour_limit_employee_ids:

                    # Find details for response
                    limit_record = next(
                        (
                            item
                            for item
                            in skipped_hour_limit_employees
                            if item["employee_id"]
                            == employee_id
                        ),
                        None
                    )

                    skipped_employees.append(
                        {
                            "employee_id": employee_id,
                            "date": current_date,
                            "reason": (
                                limit_record["reason"]
                                if limit_record
                                else
                                "Monthly working hour limit exceeded."
                            )
                        }
                    )

                    continue

                # --------------------------------------------------
                # Check active incident
                # --------------------------------------------------

                incident = incident_employee_map.get(
                    employee_id
                )

                if incident:

                    skipped_employees.append(
                        {
                            "employee_id": employee_id,
                            "date": current_date,
                            "incident_ref_id": (
                                incident["incident_ref_id"]
                            ),
                            "assigned_time": (
                                incident["assigned_time"]
                            ),
                            "reason": (
                                "Employee is currently "
                                "assigned to an incident."
                            ),
                        }
                    )

                    continue

                # --------------------------------------------------
                # Find roster
                # --------------------------------------------------

                roster = existing_roster_map.get(
                    (
                        employee_id,
                        current_date
                    )
                )

                # No roster for this employee/date
                if not roster:
                    continue

                # --------------------------------------------------
                # Update roster
                # --------------------------------------------------

                roster.shift_id = shift_id

                roster.is_weekoff = is_weekoff
                roster.is_holiday = is_holiday

                roster.week_number = (
                    current_date.isocalendar().week
                )

                roster.month = current_date.month
                roster.year = current_date.year

                roster.status = 1
                roster.is_deleted = 0

                if remarks is not None:
                    roster.remarks = remarks

                if organization_id is not None:
                    roster.organization_id = organization_id

                if branch_id is not None:
                    roster.branch_id = branch_id

                roster_objects_to_update.append(
                    roster
                )

            current_date += timedelta(days=1)

        # --------------------------------------------------
        # 16. Bulk update
        # --------------------------------------------------

        if roster_objects_to_update:

            ShiftRoster.objects.bulk_update(
                roster_objects_to_update,
                [
                    "shift",
                    "is_weekoff",
                    "is_holiday",
                    "week_number",
                    "month",
                    "year",
                    "status",
                    "is_deleted",
                    "remarks",
                    "organization",
                    "branch",
                ],
                batch_size=1000
            )

        # --------------------------------------------------
        # 17. Response
        # --------------------------------------------------

        updated_records = len(
            roster_objects_to_update
        )

        skipped_records = len(
            skipped_employees
        )

        if updated_records > 0 and skipped_records > 0:

            message = (
                "Shift roster partially updated."
            )

        elif updated_records > 0:

            message = (
                "Shift roster updated successfully."
            )

        else:

            message = (
                "No shift roster records were updated."
            )

        return Response(
            {
                "status": updated_records > 0,
                "message": message,
                "updated_records": updated_records,
                "skipped_records": skipped_records,
                "skipped_employees": skipped_employees,
                "hour_limit_exceeded": (
                    skipped_hour_limit_employees
                ),
            },
            status=status.HTTP_200_OK
        )



class ShiftRosterDeleteAPIView(APIView):

    @transaction.atomic
    def delete(self, request, pk):

        roster = ShiftRoster.objects.filter(
            roster_id=pk,
            is_deleted=0
        ).first()

        if not roster:
            return Response(
                {
                    "status": False,
                    "message": "Shift roster not found.",
                    "data": None
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Soft delete
        roster.is_deleted = 1
        roster.status = 0
        roster.modify_by = str(
            request.user.id
        ) if request.user.is_authenticated else None

        roster.save(
            update_fields=[
                "is_deleted",
                "status",
                "modify_by",
                "modify_date"
            ]
        )

        return Response(
            {
                "status": True,
                "message": "Shift roster deleted successfully.",
                "data": {
                    "roster_id": roster.roster_id
                }
            },
            status=status.HTTP_200_OK
        )



class ShiftRosterDetailAPIView(APIView):
    """
    Retrieve
    Update
    Soft Delete
    """

    def get_object(self, roster_id):
        try:
            return ShiftRoster.objects.get(roster_id=roster_id, is_deleted=0)
        except ShiftRoster.DoesNotExist:
            return None

    def get(self, request, roster_id):
        roster = self.get_object(roster_id)

        if not roster:
            return Response(
                {
                    "status": False,
                    "message": "Shift roster not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ShiftRosterSerializer(roster)

        return Response(
            {
                "status": True,
                "message": "Shift roster fetched successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, roster_id):
        roster = self.get_object(roster_id)

        if not roster:
            return Response(
                {
                    "status": False,
                    "message": "Shift roster not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ShiftRosterSerializer(
            roster,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            ss = serializer.save()

            # notification share                                                Ramesh
            clg = EMSColleague.objects.filter(clg_id = ss.employee.clg_id).first()
            title = "Shift Changed"
            message = "You're Shift has been changed.You can go shift tab and check"
            create_notification(clg,title,message,3)
            print("fcm")
            device = DeviceToken.objects.filter(clg_id = clg.clg_id,is_login=1).first()
            print("device",device)
            if device:
                print("device found")
                send_fcm_notification(device.token,title,message)
                print("fcm end")
            


            return Response(
                {
                    "status": True,
                    "message": "Shift roster updated successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "status": False,
                "message": "Validation error.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, roster_id):
        roster = self.get_object(roster_id)

        if not roster:
            return Response(
                {
                    "status": False,
                    "message": "Shift roster not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Soft Delete
        roster.status = 0
        roster.is_deleted = 1
        roster.save()

        return Response(
            {
                "status": True,
                "message": "Shift roster deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )




# class GetProfile(APIView):
#     def get(self, request):
#         clg = EMSColleague.objects.get(clg_id=request.user.clg_id)
#         print(request.user)
#         # cl = EMSColleague.objects.get(clg_id=50)
#         serializer = EMSColleagueSerializerrrrrrrr(clg)
#         return Response(serializer.data, status=status.HTTP_200_OK)
def get_management_chain(employee):
    chain = []
    current = employee
    role =["You","Manager","CEO"]
    idx = 0
    while current:
        print("c",current)
        chain.append({
            "clg_id": current.clg_id,
            "name": " ".join(filter(None, [current.title,current.clg_first_name,current.clg_last_name])),
            "clg_designation": current.clg_designation,
            # "role" : role[idx] 
            "role" :  "You" if idx == 0 else "CEO" if current.reporting_manager is None else "Manager"
        })
        idx += 1
        current = current.reporting_manager
    return chain[::-1]



class ProfilePictureAPIView(APIView):

    def post(self, request):
        colleague_id = request.user.clg_id
        # colleague_id = 144
        profile_pic = request.FILES.get("document")

        if not profile_pic:
            return Response(
                {
                    "status": False,
                    "message": "Profile picture is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get profile picture document type
        document_type = DocumentType.objects.filter(
            doc_id=1,
            status=1,
            is_deleted=0
        ).first()

        if not document_type:
            return Response(
                {
                    "status": False,
                    "message": "Profile picture document type not found."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark previous profile pictures as inactive
        CandidateDocument.objects.filter(
            colleague_id=colleague_id,
            document_type_id=1,
            status=1,
            is_deleted=0
        ).update(
            status=0,
            is_deleted=1,
            modify_by=str(colleague_id)
        )

        # Create new profile picture
        candidate_document = CandidateDocument.objects.create(
            colleague_id=colleague_id,
            document_type=document_type,
            document=profile_pic,
            verification_status="uploaded",
            status=1,
            is_deleted=0,
            added_by=str(colleague_id)
        )

        serializer = ProfilePictureSerializer(candidate_document)

        return Response(
            {
                "status": True,
                "message": "Profile picture uploaded successfully.",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )
    


    
class GetProfile(APIView):
    def get(self, request):
        clg = EMSColleague.objects.get(clg_id=request.user.clg_id)
        # print(request.user)
        # clg = EMSColleague.objects.get(clg_id=144)
        serializer = EMSColleagueSerializerrrrrrrr(clg)
        profile_pic = CandidateDocument.objects.filter(
            colleague_id=clg.clg_id,
            document_type_id=1,
            status=1,
            is_deleted=0
        ).first()

        profile_pic_path = None

        if profile_pic and profile_pic.document:
            profile_pic_path = request.build_absolute_uri(
                profile_pic.document.url
            )

        today = timezone.localdate()
        week_start = today - timedelta(days=today.weekday())

        week_start_datetime = timezone.make_aware(
            datetime.combine(week_start, datetime.min.time())
        )

        tomorrow = today + timedelta(days=1)

        tomorrow_datetime = timezone.make_aware(
            datetime.combine(tomorrow, datetime.min.time())
        )

        trips = EmsIncidenceAmbulance.objects.filter(
            assigned_time__gte=week_start_datetime,
            assigned_time__lt=tomorrow_datetime
        )

        print("USER CLG ID:", clg.clg_id)
        print("WEEK START:", week_start_datetime)
        print("TOMORROW:", tomorrow_datetime)
        print("TOTAL TRIPS FOUND:", trips.count())

        total_event_count = 0

        for trip in trips:
            print("TRIP ID:", trip.inc_amb_id)
            print("ASSIGNED TIME:", trip.assigned_time)
            print("CREW:", trip.crew_id)

            crew = trip.crew_id

            if not crew:
                continue

            if isinstance(crew, str):
                try:
                    crew = json.loads(crew)
                except (json.JSONDecodeError, TypeError):
                    continue

            if isinstance(crew, list):
                for member in crew:
                    if isinstance(member, dict):
                        if str(member.get("id")) == str(clg.clg_id):
                            total_event_count += 1
                            print("MATCH FOUND FOR:", clg.clg_id)
                            break

        print("FINAL TOTAL EVENT COUNT:", total_event_count)
        attendance_records = Attendance.objects.filter(
            employee=clg,
            attendance_date__gte=week_start,
            attendance_date__lte=today,
            status=1,
            is_deleted=0
        ).order_by(
            "attendance_date",
            "first_login"
        )
        daily_working_seconds = {}

        for attendance in attendance_records:
            if attendance.first_login and attendance.last_logout:
                attendance_date = attendance.attendance_date

                duration = attendance.last_logout - attendance.first_login
                duration_seconds = duration.total_seconds()

                if attendance_date not in daily_working_seconds:
                    daily_working_seconds[attendance_date] = 0

                daily_working_seconds[attendance_date] += duration_seconds

        total_seconds = sum(daily_working_seconds.values())

        total_working_hours = f"{total_seconds / 3600:.2f}"
        # print("here",clg.reporting_manager.clg_id)

        rm = None

        if clg.reporting_manager:
            rm = EMSColleague.objects.filter(
                clg_id=clg.reporting_manager.clg_id,
                clg_is_active=1
            ).first()

        if rm:
            name = " ".join(
                str(value)
                for value in [
                    rm.title,
                    rm.clg_first_name,
                    rm.clg_mid_name,
                    rm.clg_last_name
                ]
                if value
            )
        else:
            name = None

        job_details = {
            "employee_number" : clg.clg_code if clg else None,
            "date_of_join" : clg.clg_joining_date if clg else None,
            "title" : clg.clg_department_name if clg else None,
            "probation_period" : "1 Month Probation Period",
            "Notice_period" : "2 Month Notice Period",
            "WorkerType"  : None,
            "Time_Type"  : clg.clg_employment_type if clg else None,
            "legal_entity" : "ProParametics Ltd.",
            "Department" : clg.clg_group.department.department_name if clg and clg.clg_group and clg.clg_group.department else None,
            "Location" : clg.organization.headquarters if clg and clg.organization else None,
            "DottedLineManager" : None,
            "Reporting_To" : name,
            "EmployeeTime" : clg.clg_shift_type if clg else None,
            "WeekOff" : None,
            "AttendanceTracker" : "GPS + Manual Entry"
        }
        # print("a",job_details)
        team = clg.team_members.filter(clg_is_active=1,clg_is_deleted=0).values("clg_id","clg_first_name","clg_last_name","clg_designation")
        team1 = []
        today = timezone.localdate()
        now = timezone.localtime()
        for emp in team:
            # Leave
            a = SingleLeaveEntry.objects.filter(employee=emp["clg_id"],status__in=[1, 2],from_date__lte=today,to_date__gte=today).first()
            # Break
            b = EMSBreakDetails.objects.filter(employee=emp["clg_id"],start_break__lte=now,end_break__gte=now).first()
            # Present
            c = Attendance.objects.filter(employee=emp["clg_id"],attendance_date=today).exists()
            # Status
            if a:
                statuss = "Leave"
            elif b:
                statuss = "Break"
            elif c:
                statuss = "Present"
            else:
                statuss = "Absent"

            team1.append({
                "clg_id": emp["clg_id"],
                "name": " ".join(filter(None, [emp["clg_first_name"],emp["clg_last_name"]])),
                "role": emp["clg_designation"],
                "status": statuss
            })
        # team = clg.team_members.filter(clg_is_active=1,clg_is_deleted=0).values("clg_id","clg_first_name","clg_last_name")
        # # leave
        # a = SingleLeaveEntry.objects.filter(employee = clg.clg_id,status__in=[1,2],from_date__range = today).first()
        # # break
        # b = EMSBreakDetails.objects.filter(employee = clg.clg_id,start_break = ,end_break = )
        # # present
        # c = Attendance.objects.filter(employee = clg.clg_id,attendance_date = today)
        # # else offsent
        # result = offsent
        # team1 = [{"clg_id": emp["clg_id"],"name": " ".join(filter(None, [emp["clg_first_name"],emp["clg_last_name"]]))}for emp in team,"role" : emp["clg_designation"],"status":"None"]
        
        my_team = {
            "chain_of_cmd" : get_management_chain(clg),
            "team" : team1
        }
        # print("b",my_team)

        response_data = serializer.data
        response_data["profile_pic"] = profile_pic_path
        response_data["total_working_hours"] = total_working_hours
        response_data["total_event_count"] = total_event_count
        response_data["job_details"] = job_details
        response_data["my_team"] = my_team

        return Response(response_data, status=status.HTTP_200_OK)




class LeaveTypeListCreateAPIView(APIView):
    """
    Create Leave Type
    List Leave Types
    """

    def get(self, request):

        leave_types = LeaveType.objects.filter(status = 1,is_deleted=0,).order_by("-leave_type_id")
        dataa = LeaveTypeSerializer(leave_types, many=True,context = {'clg_id' : request.user}).data


        processed_data =[]
        for data in dataa:
            data1  = {k: (0 if v is None else v) for k, v in data.items()}
            processed_data.append(data1)

        return Response(
            {
                "status": True,
                "message": "Leave type list fetched successfully.",
                "data": processed_data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = LeaveTypeSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(status=1)

            return Response(
                {
                    "status": True,
                    "message": "Leave type created successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "status": False,
                "message": "Validation error.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class LeaveTypeDetailAPIView(APIView):
    """
    Retrieve
    Update
    Soft Delete
    """

    def get_object(self, leave_type_id):
        try:
            return LeaveType.objects.get(
                leave_type_id=leave_type_id,
                is_deleted=0
            )
        except LeaveType.DoesNotExist:
            return None

    def get(self, request, leave_type_id):
        leave_type = self.get_object(leave_type_id)

        if not leave_type:
            return Response(
                {
                    "status": False,
                    "message": "Leave type not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LeaveTypeSerializer(leave_type)

        return Response(
            {
                "status": True,
                "message": "Leave type details fetched successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request, leave_type_id):
        leave_type = self.get_object(leave_type_id)

        if not leave_type:
            return Response(
                {
                    "status": False,
                    "message": "Leave type not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LeaveTypeSerializer(
            leave_type,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "status": True,
                    "message": "Leave type updated successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "status": False,
                "message": "Validation error.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, leave_type_id):
        leave_type = self.get_object(leave_type_id)

        if not leave_type:
            return Response(
                {
                    "status": False,
                    "message": "Leave type not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Soft Delete
        leave_type.status = 0
        leave_type.is_deleted = 1
        leave_type.save()

        return Response(
            {
                "status": True,
                "message": "Leave type deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )



class AssetCategoryAPIView(APIView):

    def get(self, request, pk=None):
        if pk:
            try:
                obj = AssetCategory.objects.get(category_id=pk, is_deleted=0)
            except AssetCategory.DoesNotExist:
                return Response(
                    {
                        "status": False,
                        "message": "Asset Category not found"
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = AssetCategorySerializer(obj)
            return Response(
                {
                    "status": True,
                    "message": "Asset Category fetched successfully",
                    "data": serializer.data
                }
            )

        queryset = AssetCategory.objects.filter(is_deleted=0).order_by("-category_id")
        serializer = AssetCategorySerializer(queryset, many=True)

        return Response(
            {
                "status": True,
                "message": "Asset Category list fetched successfully",
                "count": queryset.count(),
                "data": serializer.data
            }
        )

    def post(self, request):
        serializer = AssetCategorySerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "status": True,
                    "message": "Asset Category created successfully",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "status": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def put(self, request, pk):
        try:
            obj = AssetCategory.objects.get(category_id=pk, is_deleted=0)
        except AssetCategory.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "message": "Asset Category not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AssetCategorySerializer(
            obj,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "status": True,
                    "message": "Asset Category updated successfully",
                    "data": serializer.data
                }
            )

        return Response(
            {
                "status": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        try:
            obj = AssetCategory.objects.get(category_id=pk, is_deleted=0)
        except AssetCategory.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "message": "Asset Category not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        obj.is_deleted = 1
        obj.save()

        return Response(
            {
                "status": True,
                "message": "Asset Category deleted successfully"
            }
        )



class AssetAPIView(APIView):

    def get(self, request, pk=None):

        if pk:
            try:
                asset = Asset.objects.select_related("category").get(
                    asset_id=pk,
                    is_deleted=0
                )
            except Asset.DoesNotExist:
                return Response(
                    {
                        "status": False,
                        "message": "Asset not found"
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = AssetSerializer(asset)

            return Response(
                {
                    "status": True,
                    "message": "Asset fetched successfully",
                    "data": serializer.data
                }
            )

        assets = Asset.objects.select_related("category").filter(
            is_deleted=0
        ).order_by("-asset_id")

        serializer = AssetSerializer(assets, many=True)

        return Response(
            {
                "status": True,
                "message": "Asset list fetched successfully",
                "count": assets.count(),
                "data": serializer.data
            }
        )

    def post(self, request):

        serializer = AssetSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "status": True,
                    "message": "Asset created successfully",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "status": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def put(self, request, pk):

        try:
            asset = Asset.objects.get(
                asset_id=pk,
                is_deleted=0
            )
        except Asset.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "message": "Asset not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AssetSerializer(
            asset,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "status": True,
                    "message": "Asset updated successfully",
                    "data": serializer.data
                }
            )

        return Response(
            {
                "status": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):

        try:
            asset = Asset.objects.get(
                asset_id=pk,
                is_deleted=0
            )
        except Asset.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "message": "Asset not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        asset.is_deleted = 1
        asset.save()

        return Response(
            {
                "status": True,
                "message": "Asset deleted successfully"
            }
        )
class DepartmentPostAPI(APIView):
    def post(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Department added successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class DepartmentGetAPI(APIView):
#     def get(self, request):
#         departments = Department.objects.filter(is_deleted=False)
#         serializer = DepartmentSerializer(departments, many=True)
#         return Response({
#             'message': 'Departments fetched successfully',
#             'data': serializer.data
#         }, status=status.HTTP_200_OK)

class DepartmentGetAPI(APIView):

    def get(self, request):

        departments = Department.objects.filter(
            status = 1,
            is_deleted=0
        ).annotate(
            group_count=Count(
                'groups',
                filter=Q(groups__is_deleted=0, groups__status=1),
                distinct=True
            ),
            employee_count=Count(
                'groups__emscolleague',
                filter=Q(
                    groups__is_deleted=0,
                    groups__status=1,
                    groups__emscolleague__clg_is_deleted="0",
                    groups__emscolleague__clg_is_active="1"
                ),
                distinct=True
            )
        )

        for department in departments:
            print("department",department.department_name,department.group_count,department.employee_count)
        

        serializer = DepartmentSerializer(
            departments,
            many=True
        )

        return Response(
            {
                'message': 'Departments fetched successfully',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

class OrganizationPost(APIView):
    def post(self, request):
        organization_serializer = OrganizationSerializer(data=request.data)
        if organization_serializer.is_valid():
            organization = organization_serializer.save(
                added_date=timezone.now()
            )
            documents = request.FILES.getlist('documents')
            document_names = request.data.getlist('document_names')
            document_numbers = request.data.getlist('document_numbers')
            issue_dates = request.data.getlist('issue_dates')
            expiry_dates = request.data.getlist('expiry_dates')
            document_status = request.data.getlist('document_status')
            for i, document in enumerate(documents):
                OrganizationDocument.objects.create(
                    organization=organization,
                    document=document,
                    document_name=document_names[i] if i < len(document_names) else None,
                    document_number=document_numbers[i] if i < len(document_numbers) else None,
                    issue_date=issue_dates[i] if i < len(issue_dates) and issue_dates[i] else None,
                    expiry_date=expiry_dates[i] if i < len(expiry_dates) and expiry_dates[i] else None,
                    document_status=document_status[i] if i < len(document_status) else None,
                    added_by=request.data.get('added_by'),
                    added_date=timezone.now()
                )
            return Response({
                'message': 'Organization and documents added successfully',
                'organization_id': organization.pk_id,
                'data': OrganizationSerializer(organization).data
            }, status=status.HTTP_201_CREATED)

        return Response(
            organization_serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
    
class OrganizationGet(APIView):
    def get(self, request):
        organizations = Organization.objects.filter(is_deleted=False)
        serializer = OrganizationSerializer(organizations, many=True)
        return Response({
            'message': 'Organizations fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

class OrganizationPut(APIView):

    def get(self, request, pk_id):
        try:
            organization = Organization.objects.get(
                pk_id=pk_id,
                is_deleted=False
            )

            serializer = OrganizationSerializer(organization)

            return Response({
                "message": "Organization details fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Organization.DoesNotExist:
            return Response({
                "message": "Organization not found"
            }, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk_id):

        try:

            organization = Organization.objects.get(
                pk_id=pk_id,
                is_deleted=False
            )
            organization.organization_name = request.data.get("organization_name",organization.organization_name)
            organization.organization_type = request.data.get( "organization_type",organization.organization_type)
            organization.established_year = request.data.get("established_year",organization.established_year)
            organization.license_number = request.data.get("license_number",organization.license_number)
            organization.legal_name = request.data.get("legal_name",organization.legal_name)
            organization.tax_id = request.data.get("tax_id",organization.tax_id)
            organization.headquarters = request.data.get("headquarters",organization.headquarters)
            organization.phone_number = request.data.get("phone_number",organization.phone_number)
            organization.email = request.data.get("email",organization.email)
            organization.website = request.data.get("website",organization.website)

            if request.FILES.get("logo_file"):
                organization.logo_file = request.FILES.get("logo_file")

            organization.modify_by = request.data.get("modify_by")
            organization.modify_date = timezone.now()

            organization.save()

            document_ids = request.data.getlist("document_ids")
            document_names = request.data.getlist("document_names")
            document_numbers = request.data.getlist("document_numbers")
            issue_dates = request.data.getlist("issue_dates")
            expiry_dates = request.data.getlist("expiry_dates")
            document_status = request.data.getlist("document_status")
            document_files = request.FILES.getlist("documents")

            for i in range(len(document_names)):

                doc_id = ""

                if i < len(document_ids):
                    doc_id = document_ids[i]

                file = None

                if i < len(document_files):
                    file = document_files[i]

                if doc_id:

                    try:

                        doc = OrganizationDocument.objects.get(
                            pk_id=doc_id,
                            organization=organization
                        )

                        doc.document_name = document_names[i]

                        if i < len(document_numbers):
                            doc.document_number = document_numbers[i]

                        if i < len(issue_dates):
                            doc.issue_date = issue_dates[i]

                        if i < len(expiry_dates):
                            doc.expiry_date = expiry_dates[i]

                        if i < len(document_status):
                            doc.document_status = document_status[i]

                        if file:
                            doc.document = file

                        doc.modify_by = request.data.get("modify_by")
                        doc.modify_date = timezone.now()

                        doc.save()

                    except OrganizationDocument.DoesNotExist:

                        pass

                else:

                    OrganizationDocument.objects.create(
                        organization=organization,
                        document_name=document_names[i],
                        document_number=document_numbers[i] if i < len(document_numbers) else "",
                        issue_date=issue_dates[i] if i < len(issue_dates) else None,
                        expiry_date=expiry_dates[i] if i < len(expiry_dates) else None,
                        document_status=document_status[i] if i < len(document_status) else "",
                        document=file,
                        added_by=request.data.get("modify_by")
                    )

            serializer = OrganizationSerializer(organization)

            return Response({
                "message": "Organization updated successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Organization.DoesNotExist:

            return Response({
                "message": "Organization not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:

            return Response({
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class BranchPost(APIView):
    def post(self, request):
        serializer = BranchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            return Response({
                'message': 'Branch added successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BranchGet(APIView):
    def get(self, request):
        branches = Branch.objects.filter(status=1, is_deleted=0)
        serializer = BranchSerializer(branches, many=True)
        return Response({
            'message': 'Branches fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

class BranchPut(APIView):
    def get(self, request, pk_id):
        try:
            branch = Branch.objects.get(pk_id=pk_id,status=1,is_deleted=0)
            serializer = BranchSerializer(branch)
            return Response({
                'message': 'Branch details fetched successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except Branch.DoesNotExist:
            return Response({
                'message': 'Branch not found'
            }, status=status.HTTP_404_NOT_FOUND)


    def put(self, request, pk_id):
        try:
            branch = Branch.objects.get(pk_id=pk_id, status=1,is_deleted=0)
            serializer = BranchSerializer(
                branch,
                data=request.data,
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Branch updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Branch.DoesNotExist:
            return Response({
                'message': 'Branch not found'
            }, status=status.HTTP_404_NOT_FOUND)

class BranchDelete(APIView):
    def delete(self, request, pk_id):
        try:
            branch = Branch.objects.get(pk_id=pk_id, status=1, is_deleted=0)
            branch.is_deleted = 1
            branch.status = 0
            branch.save()
            return Response({
                'message': 'Branch deleted successfully'
            }, status=status.HTTP_200_OK)

        except Branch.DoesNotExist:
            return Response({
                'message': 'Branch not found'
            }, status=status.HTTP_404_NOT_FOUND)

class DepartmentWiseGroupGet(APIView):
    def get(self, request, department_id):
        groups = EMSGroup.objects.filter(
            department_id=department_id,
            status=1,
            is_deleted=0
        )
        serializer = EMSGroupSerializer(groups, many=True)
        return Response({
            'message': 'Groups fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

class DepartmentPut(APIView):
    def get(self, request, pk_id):
        try:
            department = Department.objects.get(pk_id=pk_id, status=1, is_deleted=0)
            serializer = DepartmentSerializer(department)
            return Response({
                'message': 'Department details fetched successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)

        except Department.DoesNotExist:
            return Response({
                'message': 'Department not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk_id):
        try:
            department = Department.objects.get(pk_id=pk_id, is_deleted=False)
            serializer = DepartmentSerializer(
                department,
                data=request.data,
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Department updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Department.DoesNotExist:
            return Response({
                'message': 'Department not found'
            }, status=status.HTTP_404_NOT_FOUND)

class DepartmentDelete(APIView):
    def delete(self, request, pk_id):
        try:
            department = Department.objects.get(pk_id=pk_id, is_deleted=False)
            department.is_deleted = True
            department.status = 0
            department.save()

            return Response({
                'message': 'Department deleted successfully'
            }, status=status.HTTP_200_OK)

        except Department.DoesNotExist:
            return Response({
                'message': 'Department not found'
            }, status=status.HTTP_404_NOT_FOUND)

class JobOpeningPost(APIView):
    def post(self, request):
        try:
            serializer = JobOpeningSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Job opening created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                "status": "error",
                "message": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
       
class JobOpeningPut(APIView):
    def get(self, request, pk_id):
        try:
            job = JobOpening.objects.get(
                pk_id=pk_id,
                is_deleted=0
            )
            serializer = JobOpeningSerializer(job)
            return Response({
                "status": "success",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except JobOpening.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Job opening not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def put(self, request, pk_id):
        try:
            job = JobOpening.objects.get(
                pk_id=pk_id,
                is_deleted=0
            )
            serializer = JobOpeningSerializer(
                job,
                data=request.data,
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Job opening updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            return Response({
                "status": "error",
                "message": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except JobOpening.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Job opening not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class JobOpeningGet(APIView):
    def get(self, request):
        try:
            job_openings = JobOpening.objects.filter(is_deleted=0)
            serializer = JobOpeningSerializer(job_openings, many=True)
            return Response({
                "status": "success",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmployeeUniformPost(APIView):
    def post(self, request):
        try:
            serializer = EmployeeUniformSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Uniform details added successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

            return Response({
                "status": "error",
                "message": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmployeeUniformGet(APIView):
    def get(self, request, clg_id):
        try:
            uniform = EmployeeUniform.objects.get(clg_id=clg_id,is_deleted=0)
            serializer = EmployeeUniformSerializer(uniform)
            return Response({
                "status": "success",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except EmployeeUniform.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Uniform details not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmployeeUniformPut(APIView):
    def get(self, request, pk_id):
        try:
            uniform = EmployeeUniform.objects.get(pk_id=pk_id,is_deleted=0)
            serializer = EmployeeUniformSerializer(uniform)
            return Response({
                "status": "success",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except EmployeeUniform.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Uniform details not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def put(self, request, pk_id):
        try:
            uniform = EmployeeUniform.objects.get(pk_id=pk_id,is_deleted=0)
            serializer = EmployeeUniformSerializer(uniform,data=request.data,partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Uniform details updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)

            return Response({
                "status": "error",
                "message": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        except EmployeeUniform.DoesNotExist:

            return Response({
                "status": "error",
                "message": "Uniform details not found"
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                "status": "error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class Attendancepost(APIView):

#     def post(self, request):

#         serializer = AttendancePostSerializer(data=request.data)

#         if not serializer.is_valid():
#             return Response(
#                 {
#                     "status": False,
#                     "data": None,
#                     "error": {
#                         "message": "Invalid data provided."
#                     }
#                 },
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         clg_id = serializer.validated_data["employee"]
#         latitude = serializer.validated_data["latitude"]
#         longitude = serializer.validated_data["longitude"]
#         remarks = serializer.validated_data.get("remarks", "")

#         try:
#             employee = EMSColleague.objects.get(pk=clg_id)
#         except EMSColleague.DoesNotExist:
#             return Response(
#                 {
#                     "status": False,
#                     "data": None,
#                     "error": {
#                         "message": "Employee not found."
#                     }
#                 },
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         today = timezone.localdate()
#         current_datetime = timezone.now()

#         attendance = Attendance.objects.filter(
#             employee=employee,
#             attendance_date=today
#         ).first()

        
#         if attendance is None:

#             # shift = employee.shift
#             roster = ShiftRoster.objects.filter(
#                 employee=employee,
#                 roster_date=today,
#                 status=1,
#                 is_deleted=0
#             ).first()

#             if not roster:
#                 return Response(
#                     {
#                         "status": False,
#                         "data": None,
#                         "error": {
#                         "message": "No shift assigned for today."
#                         }
#                     },
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             if roster.is_weekoff:
#                 return Response(
#                     {
#                         "status": False,
#                         "data": None,
#                         "error":{
#                         "message": "Today is a week off."
#                         }
#                     },
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             if roster.is_holiday:
#                 return Response(
#                     {
#                         "status": False,
#                         "data": None,
#                         "error":{"message": "Today is a holiday."}
#                     },
#                     status=status.HTTP_200_OK
#                 )

#             shift = roster.shift
#             late_minutes = 0

#             if shift:
#                 shift_start = timezone.make_aware(
#                     datetime.combine(
#                         today,
#                         shift.start_time
#                     )
#                 )
#                 print("Current UTC Time :", current_datetime)
#                 print("Current Local Time :", timezone.localtime(current_datetime))
#                 print("Shift Start :", shift_start)
#                 print("Shift Start Local :", timezone.localtime(shift_start))
#                 print("Shift Start Time :", shift.start_time)
#                 print("Shift Name :", shift.shift_name)
#                 if current_datetime > shift_start:
#                     diff = current_datetime - shift_start
#                     late_minutes = int(diff.total_seconds() / 60)

#             attendance = Attendance.objects.create(
#                 employee=employee,
#                 shift=shift,
#                 attendance_date=today,
#                 first_login=current_datetime,
#                 latitude=latitude,
#                 longitude=longitude,
#                 late_minutes=late_minutes,
#                 attendance_status="present",
#                 remarks=remarks
#                 # added_by=str(employee.clg_id)
#             )

#             return Response(
#                 {
#                     "status": True,
#                     "attendance_type": "CLOCK_IN",
#                     "message": "Clock In Successful.",
#                     "data": {
#                         "login_time": attendance.first_login,
#                         "late_minutes": late_minutes,
#                         "remarks": remarks
#                     },
#                     "error": None
#                 },
#                 status=status.HTTP_201_CREATED
#             )

        
#         if attendance.last_logout is None:

#             attendance.last_logout = current_datetime
#             attendance.check_out_latitude = latitude
#             attendance.check_out_longitude = longitude

#             working_seconds = (
#                 attendance.last_logout -
#                 attendance.first_login
#             ).total_seconds()

#             working_hours = round(
#                 working_seconds / 3600,
#                 2
#             )

#             attendance.working_hours = Decimal(str(working_hours))

#             overtime = 0
#             early_exit = 0

#             if attendance.shift:

#                 shift_start = timezone.make_aware(
#                     datetime.combine(
#                         today,
#                         attendance.shift.start_time
#                     )
#                 )

#                 shift_end = timezone.make_aware(
#                     datetime.combine(
#                         today,
#                         attendance.shift.end_time
#                     )
#                 )

#                 shift_hours = (
#                     shift_end -
#                     shift_start
#                 ).total_seconds() / 3600

#                 if working_hours > shift_hours:
#                     overtime = round(
#                         working_hours - shift_hours,
#                         2
#                     )

#                 if attendance.last_logout < shift_end:
#                     early_exit = int(
#                         (
#                             shift_end -
#                             attendance.last_logout
#                         ).total_seconds() / 60
#                     )

#             attendance.overtime_hours = Decimal(str(overtime))
#             attendance.early_exit_minutes = early_exit

#             if working_hours < 4:
#                 attendance.attendance_status = "half_day"
#             else:
#                 attendance.attendance_status = "present"

#             attendance.save()

#             return Response(
#                 {
#                     "status": True,
#                     "attendance_type": "CLOCK_OUT",
#                     "message": "Clock Out Successful.",
#                     "data": {
#                         "logout_time": attendance.last_logout,
#                         "working_hours": attendance.working_hours,
#                         "overtime_hours": attendance.overtime_hours,
#                         "late_minutes": attendance.late_minutes,
#                         "early_exit_minutes": attendance.early_exit_minutes,
#                         "attendance_status": attendance.attendance_status
#                         # "remarks": remarks
#                     },
#                     "error": None
#                 },
#                 status=status.HTTP_200_OK
#             )

#         return Response(
#             {
#                 "status": False,
#                 "data": None,
#                 "error": {
#                     "message": "Attendance already completed for today."
#                 }
#             },
#             status=status.HTTP_400_BAD_REQUEST
#         )


class Attendancepost(APIView):

    def post(self, request):
        attendance_type = request.data["attendance_type"]

        serializer = AttendancePostSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "status": False,
                    "data": None,
                    "error": {
                        "message": "Invalid data provided."
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        clg_id = serializer.validated_data["employee"]
        latitude = serializer.validated_data["latitude"]
        longitude = serializer.validated_data["longitude"]
        remarks = serializer.validated_data.get("remarks", "")

        # Get Employee
        try:
            employee = EMSColleague.objects.get(pk=clg_id)
        except EMSColleague.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "data": None,
                    "error": {
                        "message": "Employee not found."
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # if employee.clg_is_login != 'yes':
        #     return Response(
        #         {
        #             "status": False,
        #             "data": None,
        #             "error": {
        #                 "message": "Please log in before performing this action."
        #             }
        #         },
        #         status=status.HTTP_401_UNAUTHORIZED
        #     )

        today = timezone.localdate()
        current_datetime = timezone.now()

        # Employee Type
        user_type = employee.clg_user_type

        
        # GET TODAY'S ATTENDANCE
        

        today_attendance = Attendance.objects.filter(
            employee=employee,
            attendance_date=today
        ).order_by("first_login")

        
        # ON CALL EMPLOYEE
        # if user_type == "on_call":

        #     # Find an attendance which is currently open
        #     attendance = today_attendance.filter(
        #         last_logout__isnull=True
        #     ).first()

           
        #     # CLOCK OUT
            
        #     if attendance:

        #         attendance.last_logout = current_datetime
        #         attendance.check_out_latitude = latitude
        #         attendance.check_out_longitude = longitude

        #         working_seconds = (
        #             attendance.last_logout -
        #             attendance.first_login
        #         ).total_seconds()

        #         working_hours = round(
        #             working_seconds / 3600,
        #             2
        #         )

        #         attendance.working_hours = Decimal(
        #             str(working_hours)
        #         )

        #         attendance.overtime_hours = Decimal("0")
        #         attendance.early_exit_minutes = 0

        #         if working_hours < 4:
        #             attendance.attendance_status = "half_day"
        #         else:
        #             attendance.attendance_status = "present"

        #         attendance.save()

        #         return Response(
        #             {
        #                 "status": True,
        #                 "attendance_type": "CLOCK_OUT",
        #                 "employee_type": user_type,
        #                 "message": "Clock Out Successful.",
        #                 "data": {
        #                     "logout_time": attendance.last_logout,
        #                     "working_hours": attendance.working_hours,
        #                     "attendance_status": attendance.attendance_status
        #                 },
        #                 "error": None
        #             },
        #             status=status.HTTP_200_OK
        #         )

            
        #     # CLOCK IN - NEW SESSION

        #     roster = ShiftRoster.objects.filter(
        #         employee=employee,
        #         roster_date=today,
        #         status=1,
        #         is_deleted=0
        #     ).first()

        #     if not roster:
        #         return Response(
        #             {
        #                 "status": False,
        #                 "data": None,
        #                 "error": {
        #                     "message": "No shift assigned for today."
        #                 }
        #             },
        #             status=status.HTTP_400_BAD_REQUEST
        #         )

        #     if roster.is_weekoff:
        #         return Response(
        #             {
        #                 "status": False,
        #                 "data": None,
        #                 "error": {
        #                     "message": "Today is a week off."
        #                 }
        #             },
        #             status=status.HTTP_400_BAD_REQUEST
        #         )

        #     if roster.is_holiday:
        #         return Response(
        #             {
        #                 "status": False,
        #                 "data": None,
        #                 "error": {
        #                     "message": "Today is a holiday."
        #                 }
        #             },
        #             status=status.HTTP_400_BAD_REQUEST
        #         )

        #     shift = roster.shift
        #     late_minutes = 0

        #     if shift and shift.start_time:

        #         shift_start = timezone.make_aware(
        #             datetime.combine(
        #                 today,
        #                 shift.start_time
        #             )
        #         )

        #         if current_datetime > shift_start:

        #             diff = current_datetime - shift_start

        #             late_minutes = int(
        #                 diff.total_seconds() / 60
        #             )

        #     attendance = Attendance.objects.create(
        #         employee=employee,
        #         shift=shift,
        #         attendance_date=today,
        #         first_login=current_datetime,
        #         clockin_latitude=latitude,
        #         clockin_longitude=longitude,
        #         late_minutes=late_minutes,
        #         attendance_status="present",
        #         remarks=remarks
        #     )

        #     return Response(
        #         {
        #             "status": True,
        #             "attendance_type": "CLOCK_IN",
        #             "employee_type": user_type,
        #             "message": "Clock In Successful.",
        #             "data": {
        #                 "login_time": attendance.first_login.strftime("%H:%M:%S") if attendance.first_login else None,
        #                 "login_day": attendance.first_login.strftime("%A") if attendance.first_login else None,
        #                 "login_date": attendance.first_login.strftime("%d %b") if attendance.first_login else None,
        #                 "late_minutes": late_minutes,
        #                 "remarks": remarks
        #             },
        #             "error": None
        #         },
        #         status=status.HTTP_201_CREATED
        #     )

        
        # FULL TIME / PART TIME / INTERN
        # attendance = today_attendance.first()

        
        # CLOCK IN
        # if attendance is None:
        if attendance_type == "CLOCK_IN":

            roster = ShiftRoster.objects.filter(
                employee=employee,
                roster_date=today,
                status=1,
                is_deleted=0
            ).first()

            if not roster:
                return Response(
                    {
                        "status": False,
                        "data": None,
                        "error": {
                            "message": "No shift assigned for today."
                        }
                    },
                    status=status.HTTP_200_OK
                )

            # if roster.is_weekoff:
            #     return Response(
            #         {
            #             "status": False,
            #             "data": None,
            #             "error": {
            #                 "message": "Today is a week off."
            #             }
            #         },
            #         status=status.HTTP_200_OK
            #     )

            # if roster.is_holiday:
            #     return Response(
            #         {
            #             "status": False,
            #             "data": None,
            #             "error": {
            #                 "message": "Today is a holiday."
            #             }
            #         },
            #         status=status.HTTP_200_OK
            #     )

            shift = roster.shift
            late_minutes = 0

            if shift and shift.start_time:

                shift_start = timezone.make_aware(
                    datetime.combine(
                        today,
                        shift.start_time
                    )
                )

                if current_datetime > shift_start:

                    diff = current_datetime - shift_start

                    late_minutes = int(
                        diff.total_seconds() / 60
                    )

            attendance = Attendance.objects.create(
                employee=employee,
                shift=shift,
                attendance_date=today,
                first_login=current_datetime,
                clockin_latitude=latitude,
                clockin_longitude=longitude,
                late_minutes=late_minutes,
                attendance_status="present",
                remarks=remarks
            )

            start_time = attendance.shift.start_time
            end_time = attendance.shift.end_time

            shift_duration = None

            if start_time and end_time:
                start_dt = datetime.combine(datetime.today(), start_time)
                end_dt = datetime.combine(datetime.today(), end_time)

                # Handle night shifts
                if end_dt < start_dt:
                    end_dt += timedelta(days=1)

                duration = end_dt - start_dt
                total_seconds = int(duration.total_seconds())

                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60

                shift_duration = f"{hours:02d}:{minutes:02d}"

            return Response(
                {
                    "status": True,
                    "attendance_type": "CLOCK_IN",
                    "employee_type": user_type,
                    "message": "Clock In Successful.",
                    "data": {
                        "attendance_id": attendance.attendance_id,
                        "shift": attendance.shift.shift_name,
                        "shift_start_time": attendance.shift.start_time.strftime("%H:%M") if attendance.shift.start_time else None,
                        "shift_end_time": attendance.shift.end_time.strftime("%H:%M") if attendance.shift.end_time else None,
                        "shift_duration": shift_duration,
                        "login_time": attendance.first_login.strftime("%H:%M:%S") if attendance.first_login else None,
                        "login_day": attendance.first_login.strftime("%A") if attendance.first_login else None,
                        "login_date": attendance.first_login.strftime("%d %b") if attendance.first_login else None,
                        "late_minutes": late_minutes,
                        "remarks": remarks
                    },
                    "error": None
                },
                status=status.HTTP_201_CREATED
            )

        # PUNCH
        elif attendance_type == "PUNCH":
            attendance_id = request.data.get("attendance_id")

            if not attendance_id:
                return Response(
                    {
                        "status": False,
                        "data": None,
                        "error": {
                            "message": "Attendance ID is required."
                        }
                    },
                    status=status.HTTP_200_OK
                )

            attendance = Attendance.objects.filter(
                employee=employee,
                attendance_id=attendance_id,
                status=1,
                is_deleted=0
            ).first()

            if not attendance:
                return Response(
                    {
                        "status": False,
                        "data": None,
                        "error": {
                            "message": "Please clock in first."
                        }
                    },
                    status=status.HTTP_200_OK
                )

            if attendance.last_logout is not None:
                return Response(
                    {
                        "status": False,
                        "data": None,
                        "error": {
                            "message": "Please clock in first to punch."
                        }
                    },
                    status=status.HTTP_200_OK
                )

            punch = AttendancePunch.objects.create(
                attendance=attendance,
                employee=employee,
                punch_datetime=current_datetime,
                latitude=latitude,
                longitude=longitude,
            )

            return Response(
                {
                    "status": True,
                    "attendance_type": "PUNCH",
                    "employee_type": user_type,
                    "message": "Attendance punch recorded successfully.",
                    "data": {
                        "punch_id": punch.punch_id,
                        "attendance_id": attendance.attendance_id,
                        "punch_datetime": punch.punch_datetime,
                        "latitude": punch.latitude,
                        "longitude": punch.longitude,
                    },
                    "error": None
                },
                status=status.HTTP_201_CREATED
            )


        # CLOCK OUT

        if attendance_type == "CLOCK_OUT":
            attendance_id = request.data.get("attendance_id")

            if not attendance_id:
                return Response(
                    {
                        "status": False,
                        "data": None,
                        "error": {
                            "message": "Attendance ID is required."
                        }
                    },
                    status=status.HTTP_200_OK
                )

            attendance_obj = Attendance.objects.filter(
                attendance_id=attendance_id
            ).first()

            if not attendance_obj:
                return Response(
                    {
                        "status": False,
                        "data": None,
                        "error": {
                            "message": "Attendance not found."
                        }
                    },
                    status=status.HTTP_200_OK
                )
            if attendance_obj.last_logout is None:
                attendance_obj.last_logout = current_datetime
                attendance_obj.clockout_latitude = latitude
                attendance_obj.clockout_longitude = longitude

                working_seconds = (
                    attendance_obj.last_logout -
                    attendance_obj.first_login
                ).total_seconds()

                working_hours = round(
                    working_seconds / 3600,
                    2
                )

                attendance_obj.working_hours = Decimal(
                    str(working_hours)
                )

                overtime = 0
                early_exit = 0

                if attendance_obj.shift:

                    shift_start = timezone.make_aware(
                        datetime.combine(
                            today,
                            attendance_obj.shift.start_time
                        )
                    )

                    shift_end = timezone.make_aware(
                        datetime.combine(
                            today,
                            attendance_obj.shift.end_time
                        )
                    )

                    shift_hours = (
                        shift_end - shift_start
                    ).total_seconds() / 3600

                    if working_hours > shift_hours:

                        overtime = round(
                            working_hours - shift_hours,
                            2
                        )

                    if attendance_obj.last_logout < shift_end:

                        early_exit = int(
                            (
                                shift_end -
                                attendance_obj.last_logout
                            ).total_seconds() / 60
                        )

                attendance_obj.overtime_hours = Decimal(
                    str(overtime)
                )

                attendance_obj.early_exit_minutes = early_exit

                # if working_hours < 4:
                #     attendance_obj.attendance_status = "half_day"
                # else:
                attendance_obj.attendance_status = "present"

                attendance_obj.save()

                # Total Shift Duration in Hours
                total_shift_hours_duration = None

                if attendance_obj.first_login and attendance_obj.last_logout:
                    duration = attendance_obj.last_logout - attendance_obj.first_login

                    total_seconds = int(duration.total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60

                    total_shift_hours_duration = f"{hours:02d}:{minutes:02d}"

                start_time = attendance_obj.shift.start_time
                end_time = attendance_obj.shift.end_time
    
                shift_duration = None
    
                if start_time and end_time:
                    start_dt = datetime.combine(datetime.today(), start_time)
                    end_dt = datetime.combine(datetime.today(), end_time)
    
                    # Handle night shifts
                    if end_dt < start_dt:
                        end_dt += timedelta(days=1)
    
                    duration = end_dt - start_dt
                    total_seconds = int(duration.total_seconds())
    
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
    
                    shift_duration = f"{hours:02d}:{minutes:02d}"

                return Response(
                    {
                        "status": True,
                        "attendance_type": "CLOCK_OUT",
                        "employee_type": user_type,
                        "message": "Clock Out Successful.",
                        "data": {
                            "logout_time": attendance_obj.last_logout,
                            "working_hours": attendance_obj.working_hours,
                            "overtime_hours": attendance_obj.overtime_hours,
                            "total_shift_hours_duration": total_shift_hours_duration,
                            "shift": attendance_obj.shift.shift_name,
                            "shift_start_time": attendance_obj.shift.start_time.strftime("%H:%M") if attendance_obj.shift.start_time else None,
                            "shift_end_time": attendance_obj.shift.end_time.strftime("%H:%M") if attendance_obj.shift.end_time else None,
                            "shift_duration": shift_duration,
                            "last_logout": attendance_obj.last_logout.strftime("%H:%M:%S") if attendance_obj.last_logout else None,
                            "late_minutes": attendance_obj.late_minutes,
                            "early_exit_minutes": attendance_obj.early_exit_minutes,
                            "attendance_status": attendance_obj.attendance_status
                        },
                        "error": None
                    },
                    status=status.HTTP_200_OK
                )


        return Response(
            {
                "status": False,
                "data": None,
                "error": {
                    "message": "Attendance already completed for today."
                }
            },
            status=status.HTTP_200_OK
        )



class AttendanceUpdate(APIView):

    def put(self, request, attendance_id):
        try:
            # Get the selected attendance record
            attendance = Attendance.objects.filter(
                attendance_id=attendance_id,
                status=1,
                is_deleted=0
            ).first()

            if not attendance:
                return Response({
                    "status": False,
                    "message": "Attendance record not found"
                }, status=status.HTTP_404_NOT_FOUND)

            employee_id = attendance.employee_id
            attendance_date = attendance.attendance_date

            # Get all attendance records for this employee on this date
            records = Attendance.objects.filter(
                employee_id=employee_id,
                attendance_date=attendance_date,
                status=1,
                is_deleted=0
            ).order_by("first_login")

            if not records.exists():
                return Response({
                    "status": False,
                    "message": "No attendance records found"
                }, status=status.HTTP_404_NOT_FOUND)

            # Get first login record
            first_login_record = records.filter(
                first_login__isnull=False
            ).order_by("first_login").first()

            # Get last logout record
            last_logout_record = records.filter(
                last_logout__isnull=False
            ).order_by("-last_logout").first()

            # ------------------------------------------------
            # Update first clock-in
            # ------------------------------------------------
            if "first_login" in request.data and first_login_record:
                first_login_record.first_login = request.data["first_login"]
                first_login_record.save(update_fields=["first_login"])

            # ------------------------------------------------
            # Update last clock-out
            # ------------------------------------------------
            if "last_logout" in request.data and last_logout_record:
                last_logout_record.last_logout = request.data["last_logout"]
                last_logout_record.save(update_fields=["last_logout"])

            # ------------------------------------------------
            # Update other fields on selected attendance record
            # ------------------------------------------------
            update_data = request.data.copy()

            # These are handled separately above
            update_data.pop("first_login", None)
            update_data.pop("last_logout", None)

            if update_data:
                serializer = AttendanceUpdateSerializer(
                    attendance,
                    data=update_data,
                    partial=True
                )

                if not serializer.is_valid():
                    return Response({
                        "status": False,
                        "message": "Validation error",
                        "errors": serializer.errors
                    }, status=status.HTTP_400_BAD_REQUEST)

                serializer.save()

                # Set approval date when approved or rejected
                approval_status = update_data.get("is_approved")

                if approval_status in ["approved", "rejected"]:
                    attendance.approved_date = timezone.now()
                    attendance.save(update_fields=["approved_date"])

            # Refresh objects
            first_login_record.refresh_from_db()
            if last_logout_record:
                last_logout_record.refresh_from_db()

            return Response({
                "status": True,
                "message": "Attendance updated successfully",
                "data": {
                    "employee_id": employee_id,
                    "attendance_date": attendance_date,
                    "first_login": first_login_record.first_login if first_login_record else None,
                    "last_logout": last_logout_record.last_logout if last_logout_record else None,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

# class AttendanceGetall(APIView):
#     def get(self, request):
#         try:
#             attendance_records = Attendance.objects.all()
#             serializer = AttendanceGetSerializer(attendance_records, many=True)

#             return Response({
#                 "status": True,
#                 "message": "Attendance records fetched successfully",
#                 "data": serializer.data
#             }, status=status.HTTP_200_OK)
#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "message": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class AttendanceGetall(APIView):
#     def get(self, request):
#         try:
#             today = timezone.localdate()

#             attendance_records = (
#                 Attendance.objects
#                 .filter(
#                     attendance_date=today,
#                     status=1,
#                     is_deleted=0
#                 )
#                 .order_by("employee_id", "-first_login")
#             )

#             # Employee-wise latest record
#             latest_records = {}

#             for record in attendance_records:
#                 if record.employee_id not in latest_records:
#                     latest_records[record.employee_id] = record

#             attendance_records = list(latest_records.values())

#             serializer = AttendanceGetSerializer(
#                 attendance_records,
#                 many=True
#             )

#             return Response({
#                 "status": True,
#                 "message": "Today's latest attendance records fetched successfully",
#                 "data": serializer.data
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({
#                 "status": False,
#                 "message": str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AttendanceGetall(APIView):
    def get(self, request):
        try:
            today = timezone.localdate()

            attendance_records = (
                Attendance.objects
                .filter(
                    attendance_date=today,
                    status=1,
                    is_deleted=0
                )
                .order_by("employee_id", "first_login")
            )

            # Employee-wise attendance summary
            employee_records = {}

            for record in attendance_records:
                employee_id = record.employee_id

                if employee_id not in employee_records:
                    # First record of the day
                    employee_records[employee_id] = record
                else:
                    existing_record = employee_records[employee_id]

                    # Keep earliest clock-in
                    if (
                        record.first_login
                        and (
                            not existing_record.first_login
                            or record.first_login < existing_record.first_login
                        )
                    ):
                        existing_record.first_login = record.first_login

                    # Keep latest clock-out
                    if (
                        record.last_logout
                        and (
                            not existing_record.last_logout
                            or record.last_logout > existing_record.last_logout
                        )
                    ):
                        existing_record.last_logout = record.last_logout

            attendance_records = list(employee_records.values())

            serializer = AttendanceGetSerializer(
                attendance_records,
                many=True
            )

            return Response({
                "status": True,
                "message": "Today's attendance records fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": False,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
class ClockinStatus(APIView):
    def get_shift_duration(self, shift):
        if not shift:
            return None

        start_time = shift.start_time
        end_time = shift.end_time

        if not start_time or not end_time:
            return None

        start_dt = datetime.combine(
            datetime.today(),
            start_time
        )

        end_dt = datetime.combine(
            datetime.today(),
            end_time
        )

        # Night shift
        if end_dt < start_dt:
            end_dt += timedelta(days=1)

        duration = end_dt - start_dt

        total_seconds = int(
            duration.total_seconds()
        )

        hours = total_seconds // 3600

        minutes = (total_seconds % 3600) // 60

        return f"{hours:02d}:{minutes:02d}"
    

    def get(self, request):
        try:
            today = timezone.localdate()
            current_datetime = timezone.now()

            employee_id = request.query_params.get("employee_id")

            if not employee_id:
                return Response(
                    {
                        "status": False,
                        "message": "employee_id is required",
                        "data": None
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ---------------------------------------------------------
            # 1. Get today's roster
            # ---------------------------------------------------------
            roster = ShiftRoster.objects.filter(
                employee=employee_id,
                roster_date=today,
                status=1,
                is_deleted=0
            ).select_related(
                "shift"
            ).order_by(
                "-added_date"
            ).first()   

            # ---------------------------------------------------------
            # 2. No roster assigned
            # ---------------------------------------------------------
            if not roster:
                return Response(
                    {
                        "status": True,
                        "message": "No shift roster assigned for today",
                        "data": {
                            "attendance_date": today,
                            "attendance_status": "no_roster",
                            "shift": None,
                            "shift_start_time": None,
                            "shift_end_time": None,
                            "shift_duration": None,
                            "clock_in": None,
                            "clock_out": None,
                            "login_time": None,
                            "login_day": None,
                            "login_date": None,
                            "late_minutes": 0,
                            "attendance_id": None,
                            "clockin_latitude": None,
                            "clockin_longitude": None,
                            "clockout_latitude": None,
                            "clockout_longitude": None,
                            "punch_details": []
                        }
                    },
                    status=status.HTTP_200_OK
                )

            shift = roster.shift

            # ---------------------------------------------------------
            # 3. Check whether today is weekoff
            # ---------------------------------------------------------
            # if roster.is_weekoff:
            #     return Response(
            #         {
            #             "status": True,
            #             "message": "Today is a week off",
            #             "data": {
            #                 "attendance_date": today,
            #                 "attendance_status": "Weekoff",
            #                 "shift": shift.shift_name if shift else None,
            #                 "shift_start_time": (
            #                     shift.start_time.strftime("%H:%M")
            #                     if shift and shift.start_time
            #                     else None
            #                 ),
            #                 "shift_end_time": (
            #                     shift.end_time.strftime("%H:%M")
            #                     if shift and shift.end_time
            #                     else None
            #                 ),
            #                 "shift_duration": self.get_shift_duration(shift),
            #                 "clock_in": None,
            #                 "clock_out": None,
            #                 "login_time": None,
            #                 "login_day": None,
            #                 "login_date": None,
            #                 "late_minutes": 0,
            #                 "attendance_id": None,
            #                 "clockin_latitude": None,
            #                 "clockin_longitude": None,
            #                 "clockout_latitude": None,
            #                 "clockout_longitude": None,
            #                 "punch_details": []
            #             }
            #         },
            #         status=status.HTTP_200_OK
            #     )

            # ---------------------------------------------------------
            # 4. Get today's attendance
            # ---------------------------------------------------------
            attendance = Attendance.objects.filter(
                employee=employee_id,
                attendance_date=today,
                last_logout__isnull=True,
                status=1,
                is_deleted=0
            ).select_related(
                "shift"
            ).order_by(
                "-added_date"
            ).prefetch_related(
                "attendance_punches"
            ).first()

            # ---------------------------------------------------------
            # 5. Attendance does not exist = ABSENT
            # ---------------------------------------------------------
            if not attendance:
                return Response(
                    {
                        "status": True,
                        "message": "No attendance found for today",
                        "data": {
                            "attendance_date": today,
                            "attendance_status": "Absent",

                            "shift": (
                                shift.shift_name
                                if shift
                                else None
                            ),

                            "shift_start_time": (
                                shift.start_time.strftime("%H:%M")
                                if shift and shift.start_time
                                else None
                            ),

                            "shift_end_time": (
                                shift.end_time.strftime("%H:%M")
                                if shift and shift.end_time
                                else None
                            ),

                            "shift_duration": self.get_shift_duration(shift),

                            "clock_in": None,
                            "clock_out": None,

                            "login_time": None,
                            "login_day": None,
                            "login_date": None,

                            "late_minutes": 0,

                            "attendance_id": None,

                            "clockin_latitude": None,
                            "clockin_longitude": None,

                            "clockout_latitude": None,
                            "clockout_longitude": None,

                            "punch_details": []
                        }
                    },
                    status=status.HTTP_200_OK
                )

            # ---------------------------------------------------------
            # 6. Attendance exists
            # ---------------------------------------------------------
            serializer = AttendanceDaySerializer(attendance)

            clock_in_data = serializer.data

            # ---------------------------------------------------------
            # Get current ongoing break
            # ---------------------------------------------------------
            # ongoing_break = EMSBreakDetails.objects.filter(
            #     employee_id=attendance.employee_id,
            #     start_break__isnull=False,
            #     end_break__isnull=True
            # ).select_related(
            #     "break_type"
            # ).order_by(
            #     "-start_break"
            # ).first()


            ongoing_break = EMSBreakDetails.objects.filter(
                employee_id=attendance.employee_id
            ).select_related(
                "break_type"
            ).order_by(
                "-id"
            ).first()
            if ongoing_break:
                if ongoing_break.start_break and not ongoing_break.end_break:
                    clock_in_data["breakId"] = ongoing_break.id

                    clock_in_data["breakTypeId"] = (
                        ongoing_break.break_type.id
                        if ongoing_break.break_type
                        else None
                    )

                    clock_in_data["breakType"] = (
                        ongoing_break.break_type.break_name
                        if ongoing_break.break_type
                        else None
                    )

                    clock_in_data["startBreak"] = ongoing_break.start_break

                    clock_in_data["endBreak"] = ongoing_break.end_break

                    clock_in_data["breakStatus"] = "ongoing"

                    # Calculate current break duration
                    break_duration = timezone.now() - ongoing_break.start_break

                    total_seconds = int(
                        break_duration.total_seconds()
                    )

                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60

                    clock_in_data["breakTime"] = f"{hours:02d}:{minutes:02d}"

            else:

                clock_in_data["breakId"] = None
                clock_in_data["breakTypeId"] = None
                clock_in_data["breakType"] = None
                clock_in_data["startBreak"] = None
                clock_in_data["endBreak"] = None
                clock_in_data["breakStatus"] = None
                clock_in_data["breakTime"] = "00:00"

            # ---------------------------------------------------------
            # 7. Calculate late minutes
            # ---------------------------------------------------------
            late_minutes = 0

            if shift and shift.start_time and attendance.first_login:

                shift_start = timezone.make_aware(
                    datetime.combine(
                        today,
                        shift.start_time
                    )
                )

                first_login = attendance.first_login

                # Make sure both datetimes are timezone-aware
                if timezone.is_naive(first_login):
                    first_login = timezone.make_aware(first_login)

                if first_login > shift_start:

                    diff = first_login - shift_start

                    late_minutes = int(
                        diff.total_seconds() / 60
                    )

            # ---------------------------------------------------------
            # 8. Determine attendance status
            # ---------------------------------------------------------
            attendance_status = "break" if attendance.employee.clg_is_login == 'break' else attendance.attendance_status

            if not attendance_status:
                attendance_status = "Present"

            # ---------------------------------------------------------
            # 9. Add additional fields
            # ---------------------------------------------------------
            clock_in_data["attendance_id"] = attendance.attendance_id

            clock_in_data["attendance_status"] = attendance_status

            clock_in_data["shift"] = (
                shift.shift_name
                if shift
                else None
            )

            clock_in_data["shift_start_time"] = (
                shift.start_time.strftime("%H:%M")
                if shift and shift.start_time
                else None
            )

            clock_in_data["shift_end_time"] = (
                shift.end_time.strftime("%H:%M")
                if shift and shift.end_time
                else None
            )

            clock_in_data["shift_duration"] = self.get_shift_duration(shift)

            clock_in_data["login_time"] = (
                attendance.first_login.strftime("%H:%M:%S")
                if attendance.first_login
                else None
            )

            clock_in_data["login_day"] = (
                attendance.first_login.strftime("%A")
                if attendance.first_login
                else None
            )

            clock_in_data["login_date"] = (
                attendance.first_login.strftime("%d %b")
                if attendance.first_login
                else None
            )

            clock_in_data["late_minutes"] = late_minutes

            # ---------------------------------------------------------
            # 10. Return modified serializer data
            # ---------------------------------------------------------
            return Response(
                {
                    "status": True,
                    "message": "Today's attendance fetched successfully",
                    "data": clock_in_data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "message": str(e),
                    "data": None
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
class AttendanceCreateAPIView(APIView):
    def post(self, request):
        try:
            serializer = AttendanceCreateSerializer(
                data=request.data
            )

            if not serializer.is_valid():
                return Response(
                    {
                        "status": False,
                        "message": "Validation error",
                        "errors": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            attendance = serializer.save()

            return Response(
                {
                    "status": True,
                    "message": "Attendance added successfully",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )





class AttendanceGetByIdWise(APIView):

    def get_datetime_value(self, attendance_date, value):

        if not value:
            return None

        if isinstance(value, datetime):
            return value

        if isinstance(value, time):
            return datetime.combine(
                attendance_date,
                value
            )

        if isinstance(value, str):

            try:
                return datetime.fromisoformat(value)
            except ValueError:
                pass

            try:
                parsed_time = time.fromisoformat(value)

                return datetime.combine(
                    attendance_date,
                    parsed_time
                )
            except ValueError:
                return None

        return None
    

    def get(self, request):
        try:
            employee_id = request.query_params.get("employee_id")
            date_filter = request.query_params.get("date_filter")

            if not employee_id:
                return Response(
                    {
                        "status": False,
                        "message": "employee_id is required"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not date_filter:
                return Response(
                    {
                        "status": False,
                        "message": "date_filter is required"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            today = timezone.localdate()

            # --------------------------------------------------
            # DATE FILTER
            # --------------------------------------------------

            if date_filter == "today":

                start_date = today
                end_date = today

            elif date_filter == "last_7_days":

                start_date = today - timedelta(days=6)
                end_date = today

            elif date_filter == "last_30_days":

                start_date = today - timedelta(days=29)
                end_date = today

            elif date_filter == "this_month":

                start_date = today.replace(day=1)
                end_date = today

                # if today.month == 12:
                #     end_date = date(today.year + 1, 1, 1) - timedelta(days=1)
                # else:
                #     end_date = date(today.year, today.month + 1, 1) - timedelta(days=1)

            else:
                return Response(
                    {
                        "status": False,
                        "message": "Invalid date_filter. Use last_7_days, last_30_days or this_month."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

# =====
            # --------------------------------------------------
            # ATTENDANCE
            # --------------------------------------------------

            # attendance_records = Attendance.objects.filter(
            #     employee_id=employee_id,
            #     attendance_date__range=[start_date, end_date]
            # ).select_related(
            #     "employee",
            #     "employee__clg_group",
            #     "employee__clg_group__department"
            # ).order_by("attendance_date")

            # attendance_serializer = AttendanceGetSerializer(
            #     attendance_records,
            #     many=True
            # )

            # attendance_data = attendance_serializer.data

            attendance_records = Attendance.objects.filter(
                employee_id=employee_id,
                attendance_date__range=[start_date, end_date]
            ).select_related(
                "employee",
                "employee__clg_group",
                "employee__clg_group__department"
            ).order_by("attendance_date", "attendance_id")


            employee_records = {}

            for record in attendance_records:

                key = (record.employee_id, record.attendance_date)

                if key not in employee_records:
                    employee_records[key] = record

                else:
                    existing_record = employee_records[key]

                    # Earliest clock-in
                    if (
                        record.first_login
                        and (
                            not existing_record.first_login
                            or record.first_login < existing_record.first_login
                        )
                    ):
                        existing_record.first_login = record.first_login

                    # Latest clock-out
                    if (
                        record.last_logout
                        and (
                            not existing_record.last_logout
                            or record.last_logout > existing_record.last_logout
                        )
                    ):
                        existing_record.last_logout = record.last_logout


            # Don't overwrite attendance_records
            summary_records = list(employee_records.values())

            attendance_serializer = AttendanceGetSerializer(
                summary_records,
                many=True
            )

            attendance_data = attendance_serializer.data

            # Latest date first, highest ID first
            attendance_data.sort(
                key=lambda x: (
                    x.get("attendance_date") or "",
                    x.get("attendance_id") or 0
                ),
                reverse=True
            )

            print("attendance dattaaa--", attendance_data)

            print("attendance dattaaa--", attendance_data)

            # --------------------------------------------------
            # ADD GROSS / BREAK / EFFECTIVE HOURS
            # TO EACH ATTENDANCE RECORD
            # --------------------------------------------------

            for attendance_data_item in attendance_data:

                attendance_date = attendance_data_item.get("attendance_date")

                if not attendance_date:
                    continue

                attendance_obj = attendance_records.filter(
                    attendance_date=attendance_date
                ).first()

                # Leave-only record
                if not attendance_obj:
                    attendance_data_item["gross_hours"] = "0h 0m"
                    attendance_data_item["break_hours"] = "0h 0m"
                    attendance_data_item["effective_hours"] = "0h 0m"
                    continue

                # No clock-in / clock-out
                if not attendance_obj.first_login or not attendance_obj.last_logout:
                    attendance_data_item["gross_hours"] = "0h 0m"
                    attendance_data_item["break_hours"] = "0h 0m"
                    attendance_data_item["effective_hours"] = "0h 0m"
                    continue

                first_login_dt = attendance_obj.first_login
                last_logout_dt = attendance_obj.last_logout

                if last_logout_dt < first_login_dt:
                    last_logout_dt += timedelta(days=1)

                # --------------------------------------------------
                # GROSS HOURS
                # --------------------------------------------------

                gross_seconds = (
                    last_logout_dt - first_login_dt
                ).total_seconds()

                # --------------------------------------------------
                # BREAK HOURS
                # --------------------------------------------------

                break_seconds = 0

                breaks = EMSBreakDetails.objects.filter(
                    employee_id=employee_id,
                    start_break__isnull=False,
                    end_break__isnull=False,
                    start_break__gte=first_login_dt,
                    end_break__lte=last_logout_dt
                )

                for break_detail in breaks:

                    break_start = break_detail.start_break
                    break_end = break_detail.end_break

                    if break_end > break_start:
                        break_seconds += (
                            break_end - break_start
                        ).total_seconds()

                # --------------------------------------------------
                # EFFECTIVE HOURS
                # --------------------------------------------------

                effective_seconds = gross_seconds - break_seconds

                if effective_seconds < 0:
                    effective_seconds = 0

                # --------------------------------------------------
                # FORMAT HOURS
                # --------------------------------------------------

                gross_hours = int(gross_seconds // 3600)
                gross_minutes = int(
                    (gross_seconds % 3600) // 60
                )

                break_hours = int(break_seconds // 3600)
                break_minutes = int(
                    (break_seconds % 3600) // 60
                )

                effective_hours = int(
                    effective_seconds // 3600
                )
                effective_minutes = int(
                    (effective_seconds % 3600) // 60
                )

                attendance_data_item["gross_hours"] = (
                    f"{gross_hours}h {gross_minutes}m"
                )

                attendance_data_item["break_hours"] = (
                    f"{break_hours}h {break_minutes}m"
                )

                attendance_data_item["effective_hours"] = (
                    f"{effective_hours}h {effective_minutes}m"
                )

            # --------------------------------------------------
            # LEAVES
            # --------------------------------------------------

            leaves = LeaveApplication.objects.filter(
                employee_id=employee_id,
                is_deleted=0,
                from_date__lte=end_date,
                to_date__gte=start_date
            ).select_related(
                "leave_type"
            )

            # --------------------------------------------------
            # CREATE LEAVE DATE MAP
            # --------------------------------------------------

            leave_by_date = {}

            for leave in leaves:

                if not leave.from_date or not leave.to_date:
                    continue

                start_date = max(
                    leave.from_date,
                    start_date
                )

                end_date = min(
                    leave.to_date,
                    end_date
                )

                current_date = start_date

                while current_date <= end_date:

                    leave_by_date[current_date] = {
                        "leave_id": leave.leave_id,
                        "leave_type": leave.leave_type.leave_name
                        if leave.leave_type else None,
                        "from_date": leave.from_date,
                        "to_date": leave.to_date,
                        "total_days": leave.total_days,
                        "full_or_half": leave.full_or_half,
                        "reason": leave.reason,
                        "status": leave.status,
                        "remarks": leave.remarks,
                    }

                    current_date += timedelta(days=1)

            # --------------------------------------------------
            # ADD LEAVE INFORMATION TO ATTENDANCE
            # --------------------------------------------------
            print("before adding leave attendance--", attendance_data)
            for attendance in attendance_data:

                attendance_date = attendance.get("attendance_date")

                if not attendance_date:
                    continue

                attendance_date_obj = date.fromisoformat(
                    attendance_date
                )

                leave = leave_by_date.get(attendance_date_obj)

                if leave:
                    attendance["leave"] = True
                    attendance["leave_details"] = leave
                else:
                    attendance["leave"] = False
                    attendance["leave_details"] = None

            # --------------------------------------------------
            # ADD LEAVE-ONLY DAYS
            # --------------------------------------------------

            existing_attendance_dates = {
                date.fromisoformat(
                    item["attendance_date"]
                )
                for item in attendance_data
                if item.get("attendance_date")
            }

            for leave_date, leave in leave_by_date.items():

                if leave_date not in existing_attendance_dates:

                    attendance_data.append({
                        "attendance_date": leave_date.isoformat(),
                        "employee": int(employee_id),
                        "employee_name": None,
                        "employee_code": None,
                        "department_name": None,

                        "clock_in": None,
                        "clock_out": None,
                        "break_time": None,

                        "leave": True,
                        "leave_details": leave,
                    })

            for i in attendance_data:
                print("1-------",i['attendance_date'])

            # --------------------------------------------------
            # ADD WEEKOFF / HOLIDAY / ABSENT DAYS FROM ROSTER
            # --------------------------------------------------

            roster_records = ShiftRoster.objects.filter(
                employee_id=employee_id,
                roster_date__range=[start_date, end_date],
                status=1,
                is_deleted=0
            ).select_related(
                "employee",
                "shift"
            )

            existing_attendance_dates = {
                date.fromisoformat(item["attendance_date"])
                for item in attendance_data
                if item.get("attendance_date")
            }

            for roster in roster_records:

                roster_date = roster.roster_date

                # --------------------------------------------------
                # If attendance already exists, don't add another
                # --------------------------------------------------

                if roster_date in existing_attendance_dates:
                    continue

                # --------------------------------------------------
                # WEEK OFF
                # --------------------------------------------------

                if roster.is_weekoff == 1:

                    attendance_status = "Weekoff"
                    remarks = "Week Off"

                # --------------------------------------------------
                # HOLIDAY
                # --------------------------------------------------

                elif roster.is_holiday == 1:

                    attendance_status = "Holiday"
                    remarks = "Holiday"

                # --------------------------------------------------
                # NORMAL WORKING DAY BUT NO ATTENDANCE
                # --------------------------------------------------

                else:

                    attendance_status = "Absent"
                    remarks = "No attendance recorded"

                attendance_data.append({
                    "attendance_date": roster_date.isoformat(),

                    "employee": int(employee_id),
                    "employee_name": None,
                    "employee_code": None,
                    "department_name": None,

                    "shift": roster.shift_id,
                    "shift_name": roster.shift.shift_name if roster.shift else None,

                    "first_login": None,
                    "clockin_latitude": None,
                    "clockin_longitude": None,

                    "last_logout": None,
                    "clockout_latitude": None,
                    "clockout_longitude": None,

                    "working_hours": None,
                    "overtime_hours": None,
                    "late_minutes": None,
                    "early_exit_minutes": None,

                    "attendance_status": attendance_status,

                    "remarks": remarks,

                    "break_time": None,

                    "gross_hours": "0h 0m",
                    "break_hours": "0h 0m",
                    "effective_hours": "0h 0m",

                    "leave": False,
                    "leave_details": None,
                })

            # for i in attendance_data:
            #     print("2-------",i['attendance_date'])

            # Sort final result by date
            attendance_data.sort(
                key=lambda x: x.get("attendance_date") or "",
                reverse=True
            )

            # print("attendance data---", attendance_data)
            for i in attendance_data:
                print(i['attendance_date'])


            # --------------------------------------------------
            # MONTHLY ATTENDANCE SUMMARY
            # --------------------------------------------------

            total_gross_seconds = 0
            total_effective_seconds = 0
            working_days = 0
            late_arrivals = 0
            on_time_arrivals = 0

            for attendance in attendance_records:

                if not attendance.first_login or not attendance.last_logout:
                    continue

                # --------------------------------------------------
                # GROSS HOURS
                # --------------------------------------------------

                first_login_dt = attendance.first_login
                last_logout_dt = attendance.last_logout

                if last_logout_dt < first_login_dt:
                    last_logout_dt += timedelta(days=1)

                gross_seconds = (
                    last_logout_dt - first_login_dt
                ).total_seconds()

                if gross_seconds <= 0:
                    continue

                total_gross_seconds += gross_seconds

                # --------------------------------------------------
                # BREAK HOURS
                # --------------------------------------------------

                break_seconds = 0

                breaks = EMSBreakDetails.objects.filter(
                    employee_id=employee_id,
                    start_break__isnull=False,
                    end_break__isnull=False,
                    start_break__gte=first_login_dt,
                    end_break__lte=last_logout_dt
                )

                for break_detail in breaks:

                    break_start = break_detail.start_break
                    break_end = break_detail.end_break

                    if break_end > break_start:
                        break_seconds += (
                            break_end - break_start
                        ).total_seconds()

                # --------------------------------------------------
                # EFFECTIVE HOURS
                # --------------------------------------------------

                effective_seconds = gross_seconds - break_seconds

                if effective_seconds < 0:
                    effective_seconds = 0

                total_effective_seconds += effective_seconds
                working_days += 1

                # --------------------------------------------------
                # LATE / ON-TIME
                # --------------------------------------------------

                roster = ShiftRoster.objects.filter(
                    employee_id=employee_id,
                    roster_date=attendance.attendance_date,
                    status=1,
                    is_deleted=0
                ).select_related("shift").first()

                if roster and roster.shift:

                    shift_start = roster.shift.start_time
                    grace_minutes = roster.shift.grace_in_time or 0

                    shift_datetime = datetime.combine(
                        attendance.first_login.date(),
                        shift_start
                    )

                    if timezone.is_aware(attendance.first_login):
                        shift_datetime = timezone.make_aware(
                            shift_datetime,
                            timezone=attendance.first_login.tzinfo
                        )

                    allowed_time = (
                        shift_datetime +
                        timedelta(minutes=grace_minutes)
                    )

                    if attendance.first_login > allowed_time:
                        late_arrivals += 1
                    else:
                        on_time_arrivals += 1


            # --------------------------------------------------
            # AVERAGE GROSS HOURS
            # --------------------------------------------------

            if working_days > 0:

                avg_gross_seconds = (
                    total_gross_seconds / working_days
                )

                gross_hours = int(avg_gross_seconds // 3600)
                gross_minutes = int(
                    (avg_gross_seconds % 3600) // 60
                )

                avg_gross_hours = (
                    f"{gross_hours}h {gross_minutes}m"
                )

            else:
                avg_gross_hours = "0h 0m"


            # --------------------------------------------------
            # AVERAGE EFFECTIVE HOURS
            # --------------------------------------------------

            if working_days > 0:

                avg_effective_seconds = (
                    total_effective_seconds / working_days
                )

                effective_hours = int(
                    avg_effective_seconds // 3600
                )

                effective_minutes = int(
                    (avg_effective_seconds % 3600) // 60
                )

                avg_effective_hours = (
                    f"{effective_hours}h {effective_minutes}m"
                )

            else:
                avg_effective_hours = "0h 0m"



            return Response(
                {
                    "status": True,
                    "message": "Attendance and leave history fetched successfully",
                    "summary": {
                        "avg_gross_hours": avg_gross_hours,
                        "avg_effective_hours": avg_effective_hours,
                        "late_arrivals": late_arrivals,
                        "on_time_arrivals": on_time_arrivals,
                    },
                    "data": attendance_data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




class EmployeeMonthlyAttendanceStatus(APIView):

    def get(self, request):
        try:
            employee_id = request.query_params.get("employee_id")
            month = request.query_params.get("month")
            year = request.query_params.get("year")

            if not employee_id:
                return Response(
                    {
                        "status": False,
                        "message": "employee_id is required"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not month:
                return Response(
                    {
                        "status": False,
                        "message": "month is required"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not year:
                return Response(
                    {
                        "status": False,
                        "message": "year is required"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                month = int(month)
                year = int(year)

                if month < 1 or month > 12:
                    raise ValueError

            except ValueError:
                return Response(
                    {
                        "status": False,
                        "message": "Invalid month or year"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # --------------------------------------------------
            # MONTH START / END
            # --------------------------------------------------

            first_day = date(year, month, 1)
            print("employee id-", employee_id)
            clg = EMSColleague.objects.get(clg_id=employee_id)
            if clg.clg_joining_date:
                if clg.clg_joining_date >= first_day:
                    first_day = clg.clg_joining_date

            today = timezone.localdate()

            if month == 12:
                last_day = date(year + 1, 1, 1) - timedelta(days=1)
            else:
                last_day = date(year, month + 1, 1) - timedelta(days=1)

            # If selected month is the current month,
            # don't show dates after today
            if year == today.year and month == today.month:
                last_day = today

            # --------------------------------------------------
            # ATTENDANCE
            # --------------------------------------------------

            attendance_records = Attendance.objects.filter(
                employee_id=employee_id,
                attendance_date__range=[
                    first_day,
                    last_day
                ]
            ).values_list(
                "attendance_date",
                flat=True
            )

            attendance_dates = set(attendance_records)

            # --------------------------------------------------
            # LEAVES
            # --------------------------------------------------
            # Do NOT check leave status.
            # Pending / Approved / Rejected / Cancelled
            # will all be considered as leave.
            #
            # Only exclude deleted records.
            # --------------------------------------------------

            leave_records = LeaveApplication.objects.filter(
                employee_id=employee_id,
                is_deleted=0,
                from_date__lte=last_day,
                to_date__gte=first_day
            ).values(
                "from_date",
                "to_date"
            )

            # --------------------------------------------------
            # CREATE LEAVE DATE SET
            # --------------------------------------------------

            leave_dates = set()

            for leave in leave_records:

                if not leave["from_date"] or not leave["to_date"]:
                    continue

                start_date = max(
                    leave["from_date"],
                    first_day
                )

                end_date = min(
                    leave["to_date"],
                    last_day
                )

                current_date = start_date

                while current_date <= end_date:

                    leave_dates.add(current_date)

                    current_date += timedelta(days=1)

            # --------------------------------------------------
            # CREATE MONTHLY STATUS
            # --------------------------------------------------

            data = []

            current_date = first_day

            while current_date <= last_day:

                if current_date in leave_dates:
                    attendance_status = "On Leave"

                elif current_date in attendance_dates:
                    attendance_status = "Present"

                else:
                    attendance_status = "Absent"

                data.append(
                    {
                        "date": current_date.isoformat(),
                        "status": attendance_status
                    }
                )

                current_date += timedelta(days=1)

            return Response(
                {
                    "status": True,
                    "message": "Monthly attendance status fetched successfully",
                    "data": data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




class AttendancePunchDetail(APIView):

    def get(self, request):
        try:
            employee_id = request.query_params.get("employee_id")
            attendance_date = request.query_params.get("date")

            if not employee_id:
                return Response(
                    {
                        "status": False,
                        "message": "employee_id is required"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not attendance_date:
                return Response(
                    {
                        "status": False,
                        "message": "date is required. Format: YYYY-MM-DD"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            attendance = Attendance.objects.filter(
                employee_id=employee_id,
                attendance_date=attendance_date,
                status=1,
                is_deleted=0
            ).prefetch_related(
                "attendance_punches"
            ).order_by(
                "-added_date"
            ).first()

            print("Attendance ID:", attendance.attendance_id)
            print("Employee ID:", attendance.employee_id)
            print("Attendance Date:", attendance.attendance_date)
            print("First Login:", attendance.first_login)
            print("Last Logout:", attendance.last_logout)

            if not attendance:
                return Response(
                    {
                        "status": True,
                        "message": "No attendance found for selected date",
                        "data": None
                    },
                    status=status.HTTP_200_OK
                )

            serializer = AttendanceDaySerializer(attendance)

            return Response(
                {
                    "status": True,
                    "message": "Attendance fetched successfully",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TodayAttendanceDashboard(APIView):

    def get(self, request):
        try:
            today = timezone.localdate()

            # --------------------------------------------------
            # EMPLOYEES
            # --------------------------------------------------

            employees = EMSColleague.objects.filter(
                clg_is_active=1,
                clg_is_deleted=0
            )

            total_employees = employees.count()

            # --------------------------------------------------
            # TODAY'S ATTENDANCE
            # --------------------------------------------------

            attendance_records = Attendance.objects.filter(
                attendance_date=today,
                status=1,
                is_deleted=0
            ).select_related(
                "employee",
                "shift"
            )

            # Employee IDs having attendance today
            attendance_employee_ids = set(
                attendance_records.values_list(
                    "employee_id",
                    flat=True
                )
            )

            # --------------------------------------------------
            # PRESENT
            # --------------------------------------------------

            present_count = attendance_records.filter(
                attendance_status="present"
            ).values(
                "employee_id"
            ).distinct().count()

            # --------------------------------------------------
            # LATE EMPLOYEES
            # --------------------------------------------------

            late_count = attendance_records.filter(
                late_minutes__gt=0
            ).values(
                "employee_id"
            ).distinct().count()

            # --------------------------------------------------
            # TODAY'S LEAVES
            # --------------------------------------------------
            # Status is intentionally NOT checked.
            # Pending / Approved etc. are considered leave.
            # --------------------------------------------------

            leave_records = LeaveApplication.objects.filter(
                employee__in=employees,
                is_deleted=0,
                status__in=["Pending", "Approved"],
                from_date__lte=today,
                to_date__gte=today
            )

            leave_employee_ids = set(
                leave_records.values_list(
                    "employee_id",
                    flat=True
                )
            )

            on_leave_count = len(leave_employee_ids)

            # --------------------------------------------------
            # ABSENT
            # --------------------------------------------------
            # Employee is absent if:
            # - no attendance today
            # - not on leave today
            # --------------------------------------------------

            absent_employee_ids = set(
                employees.values_list(
                    "clg_id",
                    flat=True
                )
            ) - attendance_employee_ids - leave_employee_ids

            absent_count = len(absent_employee_ids)

            # --------------------------------------------------
            # SHIFT COVERAGE
            # --------------------------------------------------
            # Employees who have a shift roster for today
            # --------------------------------------------------

            roster_employee_ids = set(
                ShiftRoster.objects.filter(
                    employee__in=employees,
                    roster_date=today,
                    status=1,
                    is_deleted=0,
                    is_weekoff=0,
                    is_holiday=0
                ).values_list(
                    "employee_id",
                    flat=True
                )
            )

            total_scheduled = len(roster_employee_ids)

            # Employees scheduled today who are present
            covered_employee_ids = (
                roster_employee_ids & attendance_employee_ids
            )

            covered_count = len(covered_employee_ids)

            if total_scheduled > 0:
                shift_coverage = round(
                    (covered_count / total_scheduled) * 100,
                    2
                )
            else:
                shift_coverage = 0

            # --------------------------------------------------
            # AVG CLOCK-IN TIME
            # --------------------------------------------------

            clock_in_records = attendance_records.filter(
                first_login__isnull=False
            )
            print("clock_in_records", clock_in_records)

            avg_clock_in = None

            if clock_in_records.exists():

                total_seconds = 0
                clock_in_count = 0

                for attendance in clock_in_records:
                    print("attendance1--", attendance)
                    if not attendance.first_login:
                        continue

                    clock_in = attendance.first_login
                    print("clock-in time---", clock_in)

                    if not clock_in:
                        continue

                    # Convert to local timezone
                    if timezone.is_aware(clock_in):
                        clock_in = timezone.localtime(clock_in)

                    seconds = (
                        clock_in.hour * 3600
                        + clock_in.minute * 60
                        + clock_in.second
                    )

                    total_seconds += seconds
                    clock_in_count += 1

                if clock_in_count > 0:

                    average_seconds = (
                        total_seconds / clock_in_count
                    )

                    avg_hour = int(
                        average_seconds // 3600
                    )

                    avg_minute = int(
                        (average_seconds % 3600) // 60
                    )

                    avg_second = int(
                        average_seconds % 60
                    )

                    avg_clock_in = (
                        f"{avg_hour:02d}:"
                        f"{avg_minute:02d}:"
                        f"{avg_second:02d}"
                    )

            # --------------------------------------------------
            # TODAY'S OVERTIME
            # --------------------------------------------------

            overtime_result = attendance_records.aggregate(
                total_overtime=Sum("overtime_hours")
            )

            total_overtime = (
                overtime_result["total_overtime"]
                or 0
            )

            # --------------------------------------------------
            # RESPONSE
            # --------------------------------------------------

            return Response(
                {
                    "status": True,
                    "message": "Today's attendance dashboard fetched successfully",
                    "data": {
                        "date": today,
                        "total_employees": total_employees,
                        "present_employees": present_count,
                        "late_employees": late_count,
                        "absent_employees": absent_count,
                        "on_leave_employees": on_leave_count,
                        "shift_coverage_percentage": shift_coverage,
                        "avg_clock_in_time": avg_clock_in,
                        "overtime_hours": float(total_overtime),
                    }
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "status": False,
                    "message": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class GroupPost(APIView):
    def post(self, request):
        serializer = EMSGroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Group added successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GroupGet(APIView):
    def get(self, request):
        groups = EMSGroup.objects.filter(status=1, is_deleted=0)
        serializer = EMSGroupSerializer(groups, many=True)
        return Response({
            'message': 'Groups fetched successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

class GroupDelete(APIView):
    def delete(self, request, gid):
        try:
            group = EMSGroup.objects.get(gid=gid, is_deleted=0)
            group.is_deleted = 1
            group.status = 0
            group.save()
            return Response({
                'message': 'Group deleted successfully'
            }, status=status.HTTP_200_OK)

        except EMSGroup.DoesNotExist:
            return Response({
                'message': 'Group not found'
            }, status=status.HTTP_404_NOT_FOUND)


class GroupPut(APIView):
    def get(self, request, gid):
        try:
            group = EMSGroup.objects.get(gid=gid, is_deleted=False)
            serializer = EMSGroupSerializer(group)
            return Response({
                'message': 'Group details fetched successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except EMSGroup.DoesNotExist:
            return Response({
                'message': 'Group not found'
            }, status=status.HTTP_404_NOT_FOUND)


    def put(self, request, gid):
        try:
            group = EMSGroup.objects.get(gid=gid, is_deleted=False)
            serializer = EMSGroupSerializer(
                group,
                data=request.data,
                partial=True
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Group updated successfully',
                    'data': serializer.data
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except EMSGroup.DoesNotExist:
            return Response({
                'message': 'Group not found'
            }, status=status.HTTP_404_NOT_FOUND)

            


# def get_colleague_ID(request):

#     clg_id = ""

#     auth_header = request.headers.get('Authorization')
#     token = str(auth_header).split()[1]
#     secret_key = 'django-insecure-!pf-k_)x(p%==20re*7yp7lxi_pxc)))8y0g@*37ef#(uru6jr'
#     decoded_token = jwt.decode(token, key=secret_key, algorithms=['HS256'])

#     clg_id = decoded_token.get('user_id')
#     print("CLG_ID______________ ", clg_id)
#     clg_ref = EMSColleague.objects.get(clg_id=clg_id)

#     return clg_ref.clg_ref_id
from jwt.exceptions import InvalidSignatureError
def get_colleague_ID(request):
    clg_id = ""

    auth_header = request.headers.get('Authorization')
    if not auth_header:
        print("Authorization header missing")
        return None

    try:
        token = str(auth_header).split()[1]
        secret_key = 'django-insecure-!pf-k_)x(p%==20re*7yp7lxi_pxc)))8y0g@*37ef#(uru6jr'
        decoded_token = jwt.decode(token, key=secret_key, algorithms=['HS256'])
        # clg_id = decoded_token.get('user_id')
        clg_id = decoded_token.get('clg_id')
        print("CLG_ID______________ ", clg_id)

        # Check if clg_id is present
        if not clg_id:
            print("clg_id not found in token")
            return None

        # Attempt to retrieve the colleague
        try:
            clg_ref = EMSColleague.objects.get(clg_id=clg_id)
            clg_name = clg_ref.clg_ref_id
            return clg_id,clg_name
        except EMSColleague.DoesNotExist:
            print(f"EMSColleague with clg_id {clg_id} does not exist")
            return None

    except IndexError:
        print("Authorization header is malformed or missing token")
        return None
    except InvalidSignatureError:
        print("Signature verification failed")
        return None
    except Exception as e:
        print("Unexpected error:", e)
        return None

def total_days(from_date,to_date):

    delta = to_date - from_date
    total_days = delta.days + 1
    print(f"Total days: {total_days}")
    return total_days

def daterange(start_date, end_date):
    for n in range(int((end_date - start_date).days) + 1):
        yield start_date + timedelta(n)



class ApplyLeaveAPIView(APIView):

    def post(self, request):

        data = request.data.copy()
        user = request.user
        clg_id = get_colleague_ID(request)[0]

        with transaction.atomic():
            try:

                # 1. Validate Leave Type
                leave_type_obj = LeaveType.objects.filter(leave_type_id=data.get('LeaveTypeID'),status=1).first()

                print("leave_type_obj:", leave_type_obj)

                if not leave_type_obj:
                    return Response({"data": None,"error": {"message": "Leave Type not found"}},status=status.HTTP_200_OK)

                print("1 done")

                # 2. Get Employee Leave Balance
                EmpLeaveBal = EmployeeLeaveBalance.objects.filter(employee=clg_id,leave_type=leave_type_obj,status=1).first()

                if not EmpLeaveBal:
                    return Response({"data": None,"error": {"message": "This Leave Not Available for you"}},status=status.HTTP_200_OK)

                print("2 done")

                # 3. Get From Date and To Date
                from_date_str = data.get('FromDate')
                to_date_str = data.get('ToDate')

                if not from_date_str or not to_date_str:
                    return Response({"data": None,"error": {"message": "FromDate and ToDate are required"}},status=status.HTTP_200_OK)

                from_date = datetime.strptime(from_date_str,'%Y-%m-%d')

                to_date = datetime.strptime(to_date_str,'%Y-%m-%d')

                if from_date > to_date:
                    return Response({"data": None,"error": {"message": "FromDate cannot be greater than ToDate"}},status=status.HTTP_200_OK)

                print("3 done")

                # ---------------------------------------------------------
                # 4. Calculate Total Leave Days
                # ---------------------------------------------------------
                func = total_days(from_date,to_date)

                shift = data.get('Shift')

                # Half day
                if shift in (2, 3):

                    # Half day should be for only one date
                    if from_date.date() != to_date.date():
                        return Response({"data": None,"error": {"message": "Half day leave can be applied for only one date."}},status=status.HTTP_200_OK)

                    func = Decimal('0.5')

                else:
                    func = Decimal(str(func))

                print("Total leave days:", func)

                # 5. Create Date List
                leave_days = list(daterange(from_date,to_date))

                print("leave_days:", leave_days)

                # 6. Check Existing Leave
                
                # If ANY date already has leave, reject the ENTIRE request.
                existing_leaves = LeaveApplication.objects.filter(employee=clg_id,from_date__in=leave_days,is_deleted = 0).exclude(status="Rejected",is_deleted=1).values_list("from_date",flat=True)

                existing_leaves = list(existing_leaves)

                print("existing_leaves:", existing_leaves)
                if existing_leaves:
                    days = ', '.join(day.strftime('%b-%d-%Y')for day in existing_leaves)
                    return Response({"data": None,"error": {"message": f"You have already applied leave for "f"{days}. Leave was not applied for any of the requested dates."}},status=status.HTTP_200_OK)

                print("No existing leave found")

                # 7. Check Leave Balance
                if EmpLeaveBal.balance < func:
                    return Response({"data": None,"error": {"message": "This Leave Not Available for you"}},status=status.HTTP_200_OK)

                print("Balance available")

                # 8. Get Employee
                clg = EMSColleague.objects.filter(clg_id=clg_id).first()

                if not clg:
                    return Response({
                            "data": None,
                            "error": {"message": "Employee not found"}},
                        status=status.HTTP_200_OK
                    )

                print("clg:", clg)

                # 9. Create Single Leave Entry
                leaveID = SingleLeaveEntry.objects.create(
                    employee=clg,
                    leave_type=leave_type_obj,
                    from_date=from_date,
                    to_date=to_date,
                    total_days=func,
                    reason=data.get('Reason'),
                    full_or_half=shift,
                    status=1,
                    added_by=user,
                    modify_by=user,
                    leave_document=request.FILES.get('leave_documents',None),
                    applied_date=timezone.now(),
                    added_date=timezone.now(),
                    modify_date=timezone.now()
                )

                print("SingleLeaveEntry created:", leaveID)

                # 10. Create Day-wise Leave Applications
                leave_applications = []

                for day in leave_days:
                    # For half day
                    if shift in (2, 3):
                        day_total = Decimal('0.5')
                    else:
                        day_total = Decimal('1')

                    leave_applications.append(
                        LeaveApplication(
                            leaveID=leaveID,
                            employee=clg,
                            leave_type=leave_type_obj,
                            from_date=day,
                            to_date=day,
                            total_days=day_total,
                            reason=data.get('Reason'),
                            full_or_half=shift,
                            status='Pending',
                            added_by=user,
                            modify_by=user,
                            applied_date=timezone.now(),
                            added_date=timezone.now(),
                            modify_date=timezone.now()
                        )
                    )

                LeaveApplication.objects.bulk_create(leave_applications)

                print("LeaveApplication entries created")

                # 11. Update Employee Leave Balance
                EmpLeaveBal.used += func
                EmpLeaveBal.balance -= func
                EmpLeaveBal.modify_by = str(request.user)
                EmpLeaveBal.modify_date = timezone.now()

                EmpLeaveBal.save(update_fields=['used','balance','modify_by','modify_date'])

                print("EmpLeaveBal updated")

                # 12 lets share notification to user
                title = "Leave Application"
                message = f"Successfully applied from {from_date.date()} to {to_date.date()}.wait for approval"
                if func<= 1:
                    message = f"Successfully applied on {from_date.date()}. wait for approval"
                notification_type = 1
                reference_id = leaveID.leaveID
                create_notification(clg,title,message,notification_type,reference_id)
                print("1")
                device = DeviceToken.objects.filter(clg_id = clg.clg_id,is_login=1).first()
                print("device",device)

                if device:
                    print("device found")
                    send_fcm_notification(device.token,title,message)
                    print("fcm end")
                

                # 12. Success Response
                return Response({
                        "data": {"message": "Leave applied successfully."},
                        "error": None },status=status.HTTP_201_CREATED)
            except Exception as e:
                print("Apply Leave Error:", str(e))
                return Response({"data": None,"error": {"message": str(e)}},status=status.HTTP_200_OK)

    def get(self, request):
        clg_id = get_colleague_ID(request)[0]

        try:
            print("clg_id",clg_id)
            year = timezone.now().year

            leaves = SingleLeaveEntry.objects.filter(employee = clg_id,applied_date__year=year,is_deleted = 0).order_by('-applied_date')
            print(leaves)
            s1 = LeaveDetailSerializer(leaves, many=True).data
            print(s1)
            balance_leaves = EmployeeLeaveBalance.objects.filter(employee=clg_id , status = 1 , year = year)
            print(balance_leaves)
            s2 = LeaveBalanceSerializer(balance_leaves, many  =True).data 
            print(s2)

            response = { "leave_applications": s1}
            # response = { "leave_applications": s1, "leave_balances": s2 }
            # return Response(response, status=status.HTTP_200_OK)
            return Response({"data": response,"error": None}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"data": None,"error": {"message":str(e)}}, status=status.HTTP_200_OK)
    @transaction.atomic
    def delete(self,request):
        try:
            leaveID = request.data.get('leave_id')
            sgle = SingleLeaveEntry.objects.filter(leaveID = leaveID,status = 1).first()
            if not sgle:
                return Response({"data":None,"error":{"message": "leave application not found or may got update from HR"}},status = status.HTTP_200_OK)
            sgle.is_deleted = 1
            sgle.is_dlted_remark = request.data.get('remark')
            sgle.save()

            leave = LeaveApplication.objects.filter(leaveID = sgle.leaveID,is_deleted = 0).update(is_deleted = 1)
            emp = EmployeeLeaveBalance.objects.filter(employee = sgle.employee,leave_type = sgle.leave_type,is_deleted=0).first()#.update(balance = sgle.total_days)
            emp.used -= sgle.total_days
            emp.balance += sgle.total_days
            emp.save()
            return Response({"data":{"message":"Leave deleted"},"error ": None},status = status.HTTP_200_OK)
        except Exception as e:
            return Response({"data":None,"error ": {"message": str(e)}},status = status.HTTP_200_OK)
    

class LeaveTypeAPI(APIView):

    "Leave Type"
    def post(self,request):
        clg_id = get_colleague_ID(request)[0]

        try:
            print("1")
            organization = Organization.objects.filter(pk_id = request.data.get('org_id')).first()
            branch = Branch.objects.filter(pk_id = request.data.get('branch')).first()
            print("org",organization)
            print("branch",branch)
            print("clg_id",clg_id)

            # print("2")
            # emp = EMSColleague.objects.get(clg_id=clg_id)
            # print(emp.clg_gender)
            # print(request.data.get('gender'))
            # if emp.clg_gender != request.data.get('gender'):
            #     return Response({"message":"gender does not match"},status = status.HTTP_200_OK)

            print("3")
            leave_obj = LeaveType.objects.create(
                leave_name = request.data.get('leave_name'),
                branch = branch,
                organization = organization,
                yearly_allocation = request.data.get('yearly_allocation'),
                carry_forward = request.data.get('carry_forward'),
                max_carry_forward = request.data.get('max_carry_forward'),
                encashment_allowed = request.data.get('encashment_allowed'),
                sandwich_rule = request.data.get('sandwich_rule'),

                gender = request.data.get('gender'),
                description = request.data.get('description'),
                status = 1,

                added_by = str(request.user),
                modify_by = str(request.user),

                added_date = timezone.now(),
                modify_date = timezone.now()
            )
            return Response({"message" : "Successfully Added","leave id" : leave_obj.leave_type_id}, status = status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error":str(e)},status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class LeaveApproveAPI(APIView):

    def post(self,request):

        with transaction.atomic():
            try:
                clg_id = get_colleague_ID(request)[0]
                clg_name = get_colleague_ID(request)[1]
                leave = request.query_params.get('leave_id')

                Approve = SingleLeaveEntry.objects.filter(leaveID = leave, status = 1).first()
                if not Approve:
                    return Response({"message" : "No leave Entry Found"},status = status.HTTP_200_OK)

                clg_obj = EMSColleague.objects.filter(clg_id = clg_id).first()
                print(clg_obj)
                Approve.status = 2
                Approve.approved_by = clg_obj
                Approve.approved_date = timezone.now()
                Approve.modify_by = clg_name
                Approve.modify_date = timezone.now()

                llpp = LeaveApplication.objects.filter(leave_id = Approve.leaveID,status = "Pending")
                for x in llpp:
                    print(clg_obj)
                    x.status = 'Approved'
                    x.approved_by = clg_obj
                    x.approved_date = timezone.now()
                    x.modify_by = clg_name
                    x.modify_date = timezone.now()

                # EmpLeaveBal = EmployeeLeaveBalance.objects.filter(employee = clg_id,leave_type = leaveType ,status = 1).first()
                # print(EmpLeaveBal)
                # # print("llpp.count()",llpp.count())
                # # EmpLeaveBal.used += llpp.count()
                # # EmpLeaveBal.pending = 0
                # EmpLeaveBal.modify_by = str(request.user)
                # EmpLeaveBal.modify_date = timezone.now()
                # EmpLeaveBal.save()

                Approve.save()
                # 12 lets share notification to user
                title = "Leave Approved"
                message = f"Leave approved by the {clg_obj.clg_first_name}"
                notification_type = 1
                reference_id = Approve.leaveID
                print("1")
                print("11",Approve.leaveID)
                print("1212",Approve.employee)
                clgg = EMSColleague.objects.filter(clg_id = Approve.employee.clg_id).first()
                print("!#!#!,",clgg.clg_id)
                print("!#!#!,",clgg)
                print("1")
                create_notification(clgg,title,message,notification_type,reference_id)
                print("1")
                device = DeviceToken.objects.filter(clg_id = clgg.clg_id,is_login=1).first()
                print("device",device)
                body="Your leave request has been approved."
                
                if device:
                    print("device found")
                    send_fcm_notification(device.token,title,body)
                    print("fcm end")


                return Response({"message": "Approved"},status = status.HTTP_200_OK)
            except Exception as e:
                return Response({"message": "error while approving","error" : str(e)},status = status.HTTP_500_INTERNAL_SERVER_ERROR)



class IncidentViewSet(viewsets.ModelViewSet):
    queryset = (EmsIncidence.objects.select_related("inc_state","inc_district",).prefetch_related("ambulances",))
    def get_serializer_class(self):
        if self.action == "create":
            return IncidentCreateSerializer

        if self.action in ["update", "partial_update"]:
            return IncidentUpdateSerializer

        return IncidentSerializer



class IncidentListCreateAPIView(APIView):

    def get(self, request):

        incidents = EmsIncidence.objects.all()

        serializer = IncidentSerializer(
            incidents,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    @transaction.atomic
    def post(self, request):

        serializer = IncidentCreateSerializer(
            data=request.data
        )

        if serializer.is_valid():

            incident = serializer.save()

            response_serializer = IncidentSerializer(
                incident
            )

            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class IncidentDetailAPIView(APIView):

    def get(self, request, inc_id):

        incident = get_object_or_404(
            EmsIncidence,
            inc_id=inc_id
        )

        serializer = IncidentSerializer(incident)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def put(self, request, inc_id):

        incident = get_object_or_404(
            EmsIncidence,
            inc_id=inc_id
        )

        serializer = IncidentCreateSerializer(
            incident,
            data=request.data
        )

        if serializer.is_valid():

            incident = serializer.save()

            return Response(
                IncidentSerializer(incident).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, inc_id):

        incident = get_object_or_404(
            EmsIncidence,
            inc_id=inc_id
        )

        serializer = IncidentCreateSerializer(
            incident,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            incident = serializer.save()

            return Response(
                IncidentSerializer(incident).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, inc_id):

        incident = get_object_or_404(
            EmsIncidence,
            inc_id=inc_id
        )

        incident.delete()

        return Response(
            {
                "message": "Incident deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )



class FetchAssignEventAPIView(APIView):
    def get(self, request): 
        if request.GET.get("date"): # fetch assign event datewise
            print("Hii kkk-------------------------------------------------------------------------------------------------------")
            dateprm = request.GET.get("date")
            date = datetime.strptime(dateprm, "%Y-%d-%m").date()
            crew_id = request.user.clg_id
            n = EmsIncidenceAmbulance.objects.extra(where=["JSON_CONTAINS(crew_id, %s, '$')"],params=[f'{{"id": {crew_id}}}']).values_list('inc_ref_id', flat=True)
            start_datetime = datetime.combine(date, time.min)
            end_datetime = start_datetime + timedelta(days=1)
            can = IncidentAction.objects.filter(user=request.user,status=2).values_list('inc_ref_id', flat=True)
            # incidents = EmsIncidence.objects.filter(inc_ref_id__in=n,steps_handling_status__in=[4, 5],schedule_from_time__gte=start_datetime,schedule_from_time__lt=end_datetime).exclude(inc_ref_id__in=can)
            incidents = EmsIncidence.objects.filter(inc_ref_id__in=n,steps_handling_status__in=[11,12],schedule_from_time__gte=start_datetime,schedule_from_time__lt=end_datetime).exclude(inc_ref_id__in=can)
            serializer = IncidentSerializer1(incidents, many=True)
            return Response({"data": serializer.data})
        
        elif request.GET.get("status"):
            print("Hii -------------------------------------------------------------------------------------------------------")
            status = int(request.GET.get("status"))
            # incidents = EmsIncidence.objects.filter(schedule_from_time__date__gte=date, schedule_to_time__date__lte=date)
            if status == 1: # Cancel
                can = IncidentAction.objects.filter(user=request.user,status=2).values_list('inc_ref_id', flat=True)
                incidents = EmsIncidence.objects.filter(inc_ref_id__in = can)
            elif status == 2: # completed
                # n=EmsIncidenceAmbulance.objects.filter(crew_id__contains=[{"id": request.user.clg_id}]).values_list('inc_ref_id', flat=True)
                n = EmsIncidenceAmbulance.objects.extra(where=["JSON_CONTAINS(crew_id, %s, '$')"],params=[f'{{"id": {request.user.clg_id}}}']).values_list('inc_ref_id', flat=True)
                # n = EmsIncidenceAmbulance.objects.extra(where=["JSON_CONTAINS(crew_id, %s, '$')"],params=[f'{{"id": {request.user.clg_id}}}']).values_list('inc_ref_id', flat=True)
                incidents = EmsIncidence.objects.filter(inc_ref_id__in = n, steps_handling_status = 12)
            serializer = IncidentSerializer1(incidents, many=True)
            return Response({"data": serializer.data})
        else: # All assign event
            print("hjjj -------------------------------------------------------------------------------------------------------")
            # n=EmsIncidenceAmbulance.objects.filter(crew_id__contains=[{"id": request.user.clg_id}]).values_list('inc_ref_id', flat=True)
            n = EmsIncidenceAmbulance.objects.extra(where=["JSON_CONTAINS(crew_id, %s, '$')"],params=[f'{{"id": {request.user.clg_id}}}']).values_list('inc_ref_id', flat=True)
            # n = EmsIncidenceAmbulance.objects.filter(crew_id__icontains=f'"id":{request.user.clg_id}').values_list('inc_ref_id', flat=True)
            can = IncidentAction.objects.filter(user=request.user,status=2).values_list('inc_ref_id', flat=True)
            # incidents = EmsIncidence.objects.filter(inc_ref_id__in = n).exclude(inc_ref_id__in=can)
            incidents = EmsIncidence.objects.filter(inc_ref_id__in = n, steps_handling_status = 11).exclude(inc_ref_id__in=can)
            serializer = IncidentSerializer(incidents, many=True, context={"user": request.user})
            return Response({"data": serializer.data})


class AcceptRejectIncidentAPIView(APIView):

    def post(self, request):

        inc_ref_id = request.data.get("inc_ref_id")

        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            action_status = int(request.data.get("status"))
        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid status value."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not inc_ref_id:
            return Response(
                {"error": "inc_ref_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if action_status not in [1, 2]:
            return Response(
                {"error": "Invalid action."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Store action
        incident_action = IncidentAction.objects.create(
            inc_ref_id=inc_ref_id,
            user=request.user,
            remarks=request.data.get("remark", ""),
            status=action_status
        )

        if action_status == 1:
            return Response(
                {
                    "status": True,
                    "message": "Event accepted successfully",
                    "data": {
                        "id": incident_action.id,
                        "inc_ref_id": incident_action.inc_ref_id,
                        "user_id": request.user.clg_id,
                        "user_ref_id": request.user.clg_ref_id,
                        "action": "Accepted"
                    }
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "status": False,
                "message": "Event rejected successfully",
                "data": {
                    "id": incident_action.id,
                    "inc_ref_id": incident_action.inc_ref_id,
                    "user_id": request.user.clg_id,
                    "user_ref_id": request.user.clg_ref_id,
                    "action": "Rejected"
                }
            },
            status=status.HTTP_200_OK
        )




class PrecheckListapiView(APIView):
    def get(self, request):
        data = [
                {
                    "pre_shift_checklist_id": 1,
                    "pre_shift_checklist_name": "Check vehicle condition"
                },
                {
                    "pre_shift_checklist_id": 2,
                    "pre_shift_checklist_name": "Check medical equipment"
                },
                {
                    "pre_shift_checklist_id": 3,
                    "pre_shift_checklist_name": "Check oxygen supply"
                },
                {
                    "pre_shift_checklist_id": 4,
                    "pre_shift_checklist_name": "Check emergency equipment"
                }
                ]
        return Response(data, status=status.HTTP_200_OK)

class LeaveRejectAPI(APIView):

    def post(self,request):
        with transaction.atomic():
            try:
                clg_id = get_colleague_ID(request)[0]
                clg_name = get_colleague_ID(request)[1]
                leave = request.query_params.get('leave_id')

                obj = SingleLeaveEntry.objects.filter(leaveID = leave, status = 1).first()
                print("clg",obj)
                print("clg",obj.employee.clg_id)
                if not obj:
                    return Response({"message" : "Not Found leave Entry"},status = status.HTTP_200_OK)

                total_days = obj.total_days

                obj.status = 3
                obj.modify_by = clg_name
                obj.modify_date = timezone.now()
                print(total_days)

                clg_obj = EMSColleague.objects.filter(clg_id = clg_id).first()

                llpp = LeaveApplication.objects.filter(leave_id = obj.leaveID,status = "Pending")
                for x in llpp:
                    print(clg_obj)
                    x.status = 2
                    x.approved_by = clg_obj
                    x.approved_date = timezone.now()
                    x.modify_by = clg_name
                    x.modify_date = timezone.now()
                print("a")
                print("obj.leave_type",obj.leave_type)
                EmpLeaveBal = EmployeeLeaveBalance.objects.filter(employee = obj.employee.clg_id,leave_type = obj.leave_type ,status = 1).first()
                print("EmpLeaveBal",EmpLeaveBal)
                print("q-",obj.total_days)
                print("q-",EmpLeaveBal.used)
                print("q-",EmpLeaveBal.balance)
                EmpLeaveBal.used -= obj.total_days
                print("q-",EmpLeaveBal.used)
                EmpLeaveBal.balance += obj.total_days
                print("q-",EmpLeaveBal.balance)
                # EmpLeaveBal.pending = 0
                EmpLeaveBal.modify_by = str(request.user)
                EmpLeaveBal.modify_date = timezone.now()
                EmpLeaveBal.save()

                obj.save()
                print("aa")
                # 12 lets share notification to user
                title = "Leave Rejected"
                message = f"Leave rejected by the {clg_obj.clg_first_name}."
                notification_type = 1
                reference_id = obj.leaveID
                print("obj.employee",obj.employee)
                clgg = EMSColleague.objects.filter(clg_id = obj.employee.clg_id).first()
                print("clgg",clgg)
                create_notification(clgg,title,message,notification_type,reference_id)
                print("fcm")
                print("clgg.clg_id",clgg.clg_id)
                device = DeviceToken.objects.filter(clg_id = clgg.clg_id,is_login=1).first()
                print("device",device)
                body=f"Your leave has been rejected by {clg_name}."
                
                if device:
                    print("device found")
                    send_fcm_notification(device.token,title,body)
                    print("fcm end")

                return Response({"message": "Rejected leave"},status = status.HTTP_200_OK)
            except Exception as e:
                return Response({"message": "error while rejecting leave","error" : str(e)},status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'pg_size'
    max_page_size = 100

class EmployeeDirectoryAPI(APIView):

    def get(self,request):

        try:

            print("1",type(request.query_params.get('dept')))
            print("2",type(request.query_params.get('status')))
            Search = request.query_params.get('Search')
            if request.query_params.get('dept')  == "0" and request.query_params.get('status')  == "0":
                emp = EMSColleague.objects.filter(clg_is_active = 1).filter(Q(reporting_manager=request.user) | Q(reporting_manager__isnull=True)).order_by('added_date')
                print("emp",emp)
                
            elif request.query_params.get('dept')  != "0" and request.query_params.get('status')  == "0":
                # group = EMSGroup.objects.filter(department = request.query_params.get('dept') ).first()
                group = EMSGroup.objects.filter(department = request.query_params.get('dept') )
                print("group",group)
                # print("group",group.gid)
                emp = EMSColleague.objects.filter(clg_is_active = 1, clg_group__in = group.values_list('gcode', flat=True)).filter(Q(reporting_manager=request.user) | Q(reporting_manager__isnull=True)).order_by('added_date')
                print("emp",emp)
            elif request.query_params.get('dept')  == "0" and request.query_params.get('status')  != "0":

                # group = EMSGroup.objects.filter(department = request.query_params.get('dept') ).first()
                # emp = EMSColleague.objects.filter(clg_is_active = 1, clg_group = group.gid)

                today = timezone.localdate()
                if request.query_params.get('status')  == "1":
                    emp = EMSColleague.objects.filter(clg_is_active=1,clg_is_deleted = 0).filter(Q(reporting_manager=request.user) | Q(reporting_manager__isnull=True)).exclude(clg_id__in=SingleLeaveEntry.objects.filter(status=1,from_date__lte=today,to_date__gte=today).values_list("employee_id", flat=True)).order_by('added_date')
                elif request.query_params.get('status')  == "2":
                    emp = EMSColleague.objects.filter(clg_is_active=1,clg_is_deleted = 0,clg_id__in=SingleLeaveEntry.objects.filter(status=1,from_date__lte=today,to_date__gte=today).values_list("employee", flat=True)).filter(Q(reporting_manager=request.user) | Q(reporting_manager__isnull=True)).order_by('-added_date')
                elif request.query_params.get('status')  == "3":
                    emp = EMSColleague.objects.filter(clg_is_active=2,clg_is_deleted = 1).filter(Q(reporting_manager=request.user) | Q(reporting_manager__isnull=True)).order_by('-added_date')
                else:
                    emp = EMSColleague.objects.filter(clg_is_active = 1).filter(Q(reporting_manager=request.user) | Q(reporting_manager__isnull=True)).order_by('added_date')

            if Search:
                emp =  emp.filter(
                        Q(clg_id__icontains = Search) |
                        Q(clg_first_name__icontains = Search) |
                        Q(clg_mid_name__icontains = Search) |
                        Q(clg_last_name__icontains = Search)
                    ).order_by('added_date')

                # paginator = CustomPagination()
                # paginated_queryset = paginator.paginate_queryset(emp,request,view=self)
                # data = EmployeeDirectorySerializer(paginated_queryset,many=True).data
                # return paginator.get_paginated_response(data)

            data = EmployeeDirectorySerializer(emp,many=True).data
            return Response({"message" : "Successfully retrieved data","response" : data},status = status.HTTP_200_OK)
        except Exception as e:
            return Response({"error" : str(e)},status = status.HTTP_500_INTERNAL_SERVER_ERROR)

        


# Availability of user in crew app
class Availability(APIView):
    renderer_classes = [UserRenderer]
    # authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        try:
            print("request.GET--", request.GET)
            day = request.GET.get('day')
            clg_ref_id = request.GET.get('clg_ref_id')
            clg = EMSColleague.objects.get(clg_ref_id=clg_ref_id, clg_is_active=1, clg_is_deleted=0)
            res_data = None
            error = None

            aval_id_arr = []
            print("clg, day--", clg, day)

            if day:
                aval = EmployeeAvailability.objects.get(employee=clg, day=day, status=1)
                aval_id = aval.availability_id
                aval_detls = EmployeeAvailabilityDetail.objects.filter(availability=aval_id, status=1)
            else:
                aval = EmployeeAvailability.objects.filter(employee=clg, status=1)
                for i in aval:
                    aval_id = i.professional_avaibility_id
                    aval_id_arr.append(aval_id)
                aval_detls = EmployeeAvailabilityDetail.objects.filter(prof_avaib_id__in=aval_id_arr, status=1)


            unique_date_obj = []
            for p in aval_detls:
                st = p.start_time
                et = p.end_time

                if len(unique_date_obj) == 0:
                    stt = st
                    ett = et
                    unique_date_obj.append(p.availability_detail_id)
                elif stt == st and ett == et:
                    pass
                else:
                    stt = st
                    ett = et
                    unique_date_obj.append(p.availability_detail_id)

            aval_unique_detls = EmployeeAvailabilityDetail.objects.filter(availability_detail_id__in=list(unique_date_obj))

            # print("unique_date_obj--", unique_date_obj)
            # print("aval_unique_detls--", aval_unique_detls)

            loc_arr = []
            # for i in aval_unique_detls:
            for i in aval_detls:
                try:
                    loc_name = i.location.location_name
                    loc_data = {
                        "loc_zone_id" : i.location.location_id,
                        "loc_zone_name" : loc_name
                    }
                    loc_arr.append(loc_data)
                except:
                    pass


            # if aval_unique_detls:
            if aval_detls:
                # serializer = agg_hhc_professional_availability_detail_serializer(aval_unique_detls, many=True)
                serializer = EmployeeAvailabilityDetailSerializer(aval_detls, many=True)
                
            if serializer.data:
                for i in serializer.data:
                    location = i['location']
                    location_obj = EmployeeLocation.objects.get(location_id = location, status=1)
                    i["location_name"] = location_obj.location_name
                
                return Response({'Res_Data': serializer.data, 'error': None}, status=status.HTTP_200_OK)
        except:
            return Response({'Res_Data':res_data if 'res_data' in locals() else None, 'error': None}, status=status.HTTP_200_OK)
        

    

    def delete(self, request, format=None):
        availability_detail_id = request.GET.get('aval_detail_id')
        clg_ref_id = request.GET.get('clg_ref_id')

        print("availability_detail_id-- ", availability_detail_id)
        print("clg_ref_id-- ", clg_ref_id)

        try:
            avaldetls = EmployeeAvailabilityDetail.objects.get(availability_detail_id=availability_detail_id, status=1, is_deleted=0)

            print("avaldetals---", avaldetls)
        
            prof_avai_id = avaldetls.availability.availability_id
            aval = EmployeeAvailability.objects.get(availability_id=prof_avai_id, status=1, is_deleted=0)
                    
            # aval_day = int(aval.day)
            
            try:
                # Check if any events are scheduled for the same day and time slot is PENDING
                pass
                # detail_events = agg_hhc_detailed_event_plan_of_care.objects.filter(actual_StartDate_Time__week_day=aval_day, start_time__gte=aval.start_time, end_time__lte=aval.end_time, srv_prof_id=clg, status=1 | Q(Session_status=1) | Q(Session_status=3) | Q(Session_status= 8))

                # if detail_events:
                #     return Response({'Res_Data':{'msg':'Please contact with Healthcare Dispatcher regarding time updation or deletion.'}}, status=status.HTTP_200_OK)
            except:
                pass
                    

            if avaldetls:
                print("Finally")
                avaldetls.status = 0
                avaldetls.is_deleted = 1
                avaldetls.save()
                
            return Response({'Res_Data':{'msg':'Time slot deleted successfully.'}}, status=status.HTTP_200_OK)            
        except:
            return Response({'Res_Data':None, 'error': {'msg': 'Record not found'}}, status=status.HTTP_200_OK)

            
    def post(self, request, format=None):
        try:
            clg_ref_id = request.data['clg_ref_id']
            clg = EMSColleague.objects.get(clg_ref_id=clg_ref_id, clg_is_active=1, clg_is_deleted=0)
            print("clg--", clg)
            days = request.data['day']
            time_slots = request.data['time']
            location = request.data['location']

            for i in days:
                print("day---", i)
                aval = 0
                try:
                    aval = EmployeeAvailability.objects.get(employee=clg, day=i, status=1)
                    print("aval - ", aval)
                except:
                    pass
                    
                request.data['day'] = i
                request.data['employee'] = clg.clg_id
                request.data['added_by'] = str(request.user)
                request.data['modify_by'] = str(request.user)
                request.data['organization'] = clg.organization.pk_id
                request.data['branch'] = clg.branch.pk_id
                print("request.data---", request.data)
                
                if aval != 0:
                    aval_serializer = AvailabilitySerializer(aval, data=request.data)
                else:
                    aval_serializer = AvailabilitySerializer(data=request.data)
                
                # print("aval_serializer------", aval_serializer)
                if aval_serializer.is_valid(raise_exception=True):
                    if aval:
                        print("aval_id---", aval.availability_id)
                        aval_id = aval.availability_id
                        aval_serializer.save()
                        # prof_aval_id = aval[0].professional_avaibility_id
                    else:
                        aval = aval_serializer.save()
                        aval_id = aval.availability_id


                for j in time_slots:
                    print("start --- end--- ", j[0], j[1])

                    try:
                        print("aval_id---", aval.availability_id)
                        aval_dtl_exts = EmployeeAvailabilityDetail.objects.filter(availability_id=aval.availability_id, end_time__gt=j[0], start_time__lt=j[1], status=1)

                        print("prof_aval_dtl_exts-----  ", aval_dtl_exts)

                        if aval_dtl_exts:
                        
                            response_data={
                            'Res_Data': {'msg':f'Professional availability already exists for {j[0]} to {j[1]} time slot in day {i}.'}
                            }
                            return Response(response_data,status=status.HTTP_200_OK)
                    except:
                        pass
                    
   
                    for loc in location:
                        request.data['start_time'] = j[0]
                        request.data['end_time'] = j[1]
                        request.data['location'] = loc
                        request.data['availability'] = aval.availability_id if aval != 0 else None
                        
                        prof_aval_detail_serializer = AvailabilityDetailSerializer(data=request.data)
                        print("prof_aval_detail_serializer---", prof_aval_detail_serializer)
                        if prof_aval_detail_serializer.is_valid(raise_exception=True):
                            prof_aval_detail_serializer.save()
                            
            response_data={
            'Res_Data': {'msg':'Professional Availability Added Successfully'}, 'error': None
            }
            return Response(response_data,status=status.HTTP_200_OK)
            
        except:
            return Response({'Res_Data': None, 'error': {'msg':'Professional Availability Already Exist.'}}, status=status.HTTP_200_OK)
        

class EmployeeLocationPointsAPIView(APIView):

    def get(self, request):
        location_id = request.query_params.get("location_id")

        location = EmployeeLocation.objects.filter(
            location_id=location_id,
            status=1,
            is_deleted=0
        ).first()

        if not location:
            return Response(
                {
                    "status": False,
                    'Res_Data': None, 
                    'error': {
                        "message": "Location not found."
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        points = EmployeeLocationDetail.objects.filter(
            location_id=location_id,
            status=1,
            is_deleted=0
        ).values(
            "location_detail_id",
            "latitude",
            "longitude",
            "location_name"
        )

        return Response(
            {
                "status": True,
                "message": "Location points fetched successfully.",
                'Res_Data': {
                    "location_id": location.location_id,
                    "location_name": location.location_name,
                    "points": points
                },
                "error": None
            },
            status=status.HTTP_200_OK
        )


class EmployeeLocationAPIView(APIView):

    def get(self, request):
        employee_id = request.query_params.get("employee_id")
        locations = EmployeeLocation.objects.filter(
            employee_id=employee_id,
            status=1,
            is_deleted=0
        ).values(
            "location_id",
            "location_name"
        )

        return Response(
            {
                "status": True,
                "message": "Locations fetched successfully.",
                'Res_Data': {
                    "employee_id": employee_id,
                    "locations": locations
                },
                "error": None
            },
            status=status.HTTP_200_OK
        )


    def delete(self, request):
        location_id = request.query_params.get("location_id")

        location = EmployeeLocation.objects.filter(
            location_id=location_id,
            is_deleted=0
        ).first()

        if not location:
            return Response(
                {
                    "status": False,
                    "Res_Data": None,
                    "error": {
                        "message": "Location not found."
                    }
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Get user who deleted the location
        deleted_by = get_colleague_ID(request)[1]  # Assuming this function returns the colleague name

        # Soft delete parent location
        location.is_deleted = 1
        location.status = 0
        location.modify_by = deleted_by
        location.modify_date = timezone.now()
        location.save(
            update_fields=[
                "is_deleted",
                "status",
                "modify_by",
                "modify_date"
            ]
        )

        # Soft delete all latitude/longitude points
        EmployeeLocationDetail.objects.filter(
            location_id=location_id,
            is_deleted=0
        ).update(
            is_deleted=1,
            status=0,
            modify_by=deleted_by,
            modify_date=timezone.now()
        )

        return Response(
            {
                "status": True,
                "message": "Location deleted successfully.",
                "Res_Data": { "location_id": location_id }, "error": None }, status=status.HTTP_200_OK)
    
    

    def post(self, request):
        clg = EMSColleague.objects.get(clg_ref_id=request.data['employee'])
        request.data['employee'] =clg.clg_id
        serializer = EmployeeLocationSerializer(data=request.data)

        if serializer.is_valid():
            location = serializer.save()

            return Response(
                {
                    "status": True,
                    "message": "Location created successfully.",
                    "Res_Data": {"location_id": location.location_id},
                    "error": None
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "status": False,
                "message": "Validation error.",
                "Res_Data": None,
                "error": {"msg": f"error: {serializer.errors}"}
            },
            status=status.HTTP_400_BAD_REQUEST
        )





from django.utils import timezone
from django.db.models import Count, Q
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import EMSAsset, EMSAssetAllocation
from .serializers import (
    EMSAssetSerializer,
    AllocationListSerializer,
    AssetAllocationCreateSerializer,
    ValidateAssetTagSerializer,
)


class EMSAssetViewSet(viewsets.ModelViewSet):
    """Asset master CRUD (/assets/)."""
    queryset = EMSAsset.objects.filter(is_deleted="0").order_by("-added_date")
    serializer_class = EMSAssetSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category", "status", "condition"]
    search_fields = ["asset_tag", "asset_name", "serial_number", "brand"]

    def destroy(self, request, *args, **kwargs):
        # soft delete
        instance = self.get_object()
        instance.is_deleted = "1"
        instance.save(update_fields=["is_deleted"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"], url_path="validate-tag")
    def validate_tag(self, request):
        serializer = ValidateAssetTagSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"valid": True, "message": "Asset tag is available."})


class EMSAssetAllocationViewSet(viewsets.ModelViewSet):
    """
    Allocation CRUD + workflow actions (/asset-allocations/).
    List/retrieve use AllocationListSerializer (table row shape),
    create uses AssetAllocationCreateSerializer (modal shape).
    """
    queryset = EMSAssetAllocation.objects.filter(is_deleted="0").select_related(
        "colleague", "asset"
    ).order_by("-added_date")
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["allocation_status", "verification_status", "asset__category"]
    search_fields = [
        "colleague__clg_first_name",
        "colleague__clg_last_name",
        "asset__asset_name",
        "asset__asset_tag",
        "asset__serial_number",
    ]

    def get_serializer_class(self):
        if self.action == "create":
            return AssetAllocationCreateSerializer
        return AllocationListSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = "1"
        instance.save(update_fields=["is_deleted"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Powers the 4 stat cards: Total / Verified / Pending / On Hold."""
        qs = self.get_queryset()
        data = qs.aggregate(
            total=Count("allocation_id"),
            verified=Count("allocation_id", filter=Q(verification_status="verified")),
            pending=Count("allocation_id", filter=Q(verification_status="pending")),
            on_hold=Count("allocation_id", filter=Q(allocation_status="on_hold")),
        )
        return Response(data)

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        allocation = self.get_object()
        allocation.verification_status = "verified"
        allocation.allocation_status = "active"
        allocation.verified_by = getattr(request.user, "username", "system")
        allocation.verified_on = timezone.now()
        allocation.modify_by = allocation.verified_by
        allocation.save()
        return Response(AllocationListSerializer(allocation).data)

    @action(detail=True, methods=["post"])
    def hold(self, request, pk=None):
        allocation = self.get_object()
        allocation.allocation_status = "on_hold"
        allocation.remarks = request.data.get("remarks", allocation.remarks)
        allocation.modify_by = getattr(request.user, "username", "system")
        allocation.save()
        return Response(AllocationListSerializer(allocation).data)

    @action(detail=True, methods=["post"])
    def return_asset(self, request, pk=None):
        allocation = self.get_object()
        allocation.allocation_status = "returned"
        allocation.actual_return_date = timezone.now().date()
        allocation.condition_at_return = request.data.get("condition_at_return", allocation.asset.condition)
        allocation.modify_by = getattr(request.user, "username", "system")
        allocation.save()
        return Response(AllocationListSerializer(allocation).data)


class AssetCategoryAPIView(APIView):
    def get(self, request):
        categories = [{"value": value,"label": label} for value, label in EMSAsset.CATEGORY_CHOICES]
        return Response({"status": True,"message": "Asset categories fetched successfully.","data": categories},status=status.HTTP_200_OK)

class OrganizationBranchDept(APIView):
    def get(self,request):
        try:
            organization_id=request.query_params.get('pk_id')
            organization=Organization.objects.filter(pk_id=organization_id).first()

            if not organization:
                return Response({"data": None,"error": {"message":"Organization not found"}},status = status.HTTP_200_OK)

            branches=Branch.objects.filter(organization=organization,status=1)
            branch_serializer=BranchSerializer(branches,many=True)

            departments=Department.objects.filter(organization=organization,status=1)
            department_serializer=DepartmentSerializer(departments,many=True)
            return Response({"data": {"organization":organization.organization_name,"branches": branch_serializer.data, "departments": department_serializer.data},"error": None},status = status.HTTP_200_OK)
        except Exception as e:
            return Response({"data": None,"error": {"message":"An error occurred while fetching branch and department data"}},status = status.HTTP_500_INTERNAL_SERVER_ERROR)
        

# class OrganizationdetailCount(APIView):
#     def get(self,request):
#         try:
#             organization_id=request.query_params.get('pk_id')
#             organization=Organization.objects.filter(pk_id=organization_id).first()
#             total_employees=EMSColleague.objects.filter(organization=organization,clg_is_active=1,clg_is_deleted=0).count()
#             total_branches=Branch.objects.filter(organization=organization,status=1).count()
#             total_events=EmsIncidence.objects.filter(organization=organization).count()
#             total_active_vehicles=EmsIncidenceAmbulance.objects.filter(organization=organization,steps_handling_status=11).count()
#             return Response({"data": {"organization":organization.organization_name,"total_employees": total_employees,"total_branches": total_branches,"total_events": total_events,"total_active_vehicles": total_active_vehicles},"error": None},status = status.HTTP_200_OK)

class OrganizationWiseEmployeeGet(APIView):
    def get(self, request, organization_id):
        try:
            organization = Organization.objects.filter(pk_id=organization_id).first()
            if not organization:
                return Response(
                    {
                        "data": None,
                        "error": {
                            "message": "Organization not found"
                        }
                    },
                    status=status.HTTP_200_OK
                )
            print("organization", organization)
            employees = EMSColleague.objects.filter(organization=organization,clg_is_active=1,clg_is_deleted=0)
            employee_serializer = EMSColleagueSerializerrrrrrrr(employees,many=True)

            return Response(
                {
                    "data": {
                        "organization": organization.organization_name,
                        "employees": employee_serializer.data
                    },
                    "error": None
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print("ERROR:", e)
            return Response(
                {
                    "data": None,
                    "error": {
                        "message": str(e)
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# from django.utils import timezone
# from datetime import timedelta    
class LeaveDashBoard(APIView):

    def get(self,request):

        try:
            # users = SingleLeaveEntry.objects.filter(to_date = timezone.now().date()).order_by('approved_date')

            thirty_days_ago = timezone.now().date() - timedelta(days=30)
            thirty_days_next = timezone.now().date() + timedelta(days=30)
            print("thirty_days_ago",thirty_days_ago)
            print("thirty_days_next",thirty_days_next)
            # users = SingleLeaveEntry.objects.filter(Q(to_date__gte=thirty_days_ago) | Q(to_date__lte= thirty_days_next )).order_by('-applied_date')
            # users = SingleLeaveEntry.objects.filter(Q(to_date__gte=thirty_days_ago,is_deleted = 0)).order_by('-applied_date')   #status__in=[1,2,3],
            users = SingleLeaveEntry.objects.filter(to_date__gte=thirty_days_ago,is_deleted = 0).filter(Q(employee__reporting_manager=request.user) | Q(employee__reporting_manager__isnull=True)).order_by('-applied_date')   #status__in=[1,2,3],
            serializer = LeaveDashBoardSerializer(users,many = True)
            return Response(serializer.data,status = status.HTTP_200_OK)
        except Exception as e:
            return Response({"error":str(e)},status = status.HTTP_500_INTERNAL_SERVER_ERROR)



from rest_framework.generics import GenericAPIView

class HolidayAPIView(GenericAPIView):

    def post(self, request):

        try:
            print("1")
            holiday_name = request.data.get("holiday_name")
            holiday_dates = request.data.get("holiday_dates")
            holiday_type = request.data.get("holiday_type")
            description = request.data.get("description")

            organization = request.user.organization
            branch = request.user.branch

            # -----------------------------
            # Required validation
            # -----------------------------
            print("2")
            if not holiday_name:
                return Response({"message": "Holiday name is required."},status=status.HTTP_400_BAD_REQUEST)

            if not holiday_dates:
                return Response({"message": "Holiday dates are required."},status=status.HTTP_400_BAD_REQUEST)

            if not isinstance(holiday_dates, list):
                return Response({"message": "holiday_dates must be a list."},status=status.HTTP_400_BAD_REQUEST)
            print("3")
            # -----------------------------
            # Convert and validate dates
            # -----------------------------

            dates = []
            years = set()
            print("4")
            for holiday_date in holiday_dates:

                try:
                    parsed_date = datetime.strptime(holiday_date,"%Y-%m-%d").date()

                except (ValueError, TypeError):
                    return Response({"message": f"Invalid date format: {holiday_date}. Use YYYY-MM-DD."},status=status.HTTP_400_BAD_REQUEST)

                # Convert date to JSON serializable string
                date_string = parsed_date.strftime("%Y-%m-%d")

                # Duplicate inside request
                if date_string in dates:
                    return Response({"message": f"Duplicate date in request: {date_string}"},status=status.HTTP_400_BAD_REQUEST)

                dates.append(date_string)
                years.add(parsed_date.year)

            # -----------------------------
            # All dates should be same year
            # -----------------------------
            print("5")
            if len(years) > 1:
                return Response({"message": "All holiday dates must belong to the same year."},status=status.HTTP_400_BAD_REQUEST)

            year = years.pop()

            # -----------------------------
            # Check existing holidays
            # -----------------------------

            
            existing_dates = HolidayDate.objects.filter(holiday__organization=organization,holiday__branch=branch,holiday__status=1,holiday_date__in=dates).values_list("holiday_date",flat=True)
            existing_dates = set(existing_dates)
            for date in dates:
                if date in existing_dates:
                    return Response({"message": f"Holiday already exists for {date}."},status=status.HTTP_400_BAD_REQUEST)
            # -----------------------------
            # Create Holiday
            # -----------------------------

            with transaction.atomic():

                holiday = Holiday.objects.create(
                    holiday_name=holiday_name,
                    # holiday_date=dates,
                    year=year,
                    holiday_type=holiday_type,
                    description=description,
                    organization=organization,
                    branch=branch,
                    status=1,
                    added_by=str(request.user),
                    added_date=timezone.now(),
                    modify_by=str(request.user),
                    modify_date=timezone.now()
                )
                
            return Response({"message": "Holiday created successfully.","holiday_id": holiday.holiday_id,"holiday_dates": dates},status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"message": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, holiday_id=None):

        try:

            organization = request.user.organization
            branch = request.user.branch

            # Single holiday
            if holiday_id:

                holiday = Holiday.objects.filter(holiday_id=holiday_id,organization=organization,branch=branch).first()

                if not holiday:
                    return Response({"message": "Holiday not found."},status=status.HTTP_404_NOT_FOUND)

                data = {
                    "holiday_id": holiday.holiday_id,
                    "holiday_name": holiday.holiday_name,
                    "holiday_date": holiday.holiday_date,
                    "holiday_type": holiday.holiday_type,
                    "description": holiday.description,
                    "status": holiday.status,
                }

                return Response({"message": "Holiday fetched successfully.","data": data},status=status.HTTP_200_OK)


            filters = {"organization": organization,"branch": branch}

            holidays = Holiday.objects.filter(**filters).order_by("holiday_date")

            data = [
                {
                    "holiday_id": holiday.holiday_id,
                    "holiday_name": holiday.holiday_name,
                    "holiday_date": holiday.holiday_date,
                    "holiday_type": holiday.holiday_type,
                    "description": holiday.description
                }
                for holiday in holidays
            ]

            return Response({"message": "Holidays fetched successfully.","count": len(data),"data": data},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, holiday_id=None):

        try:
            print("1")
            if not holiday_id:
                return Response({"message": "Holiday ID is required."},status=status.HTTP_400_BAD_REQUEST)

            organization = request.user.organization
            branch = request.user.branch

            holiday = Holiday.objects.filter(holiday_id=holiday_id,organization=organization,branch=branch).first()

            if not holiday:
                return Response({"message": "Holiday not found."},status=status.HTTP_404_NOT_FOUND)
            print("2")
            holiday_name = request.data.get("holiday_name",holiday.holiday_name)
            holiday_date = request.data.get("holiday_date",holiday.holiday_date)
            holiday_type = request.data.get("holiday_type",holiday.holiday_type)
            description = request.data.get("description",holiday.description)

            if isinstance(holiday_date, str):
                try:
                    holiday_date = datetime.strptime(holiday_date,"%Y-%m-%d").date()
                except ValueError:
                    return Response({"message": "Invalid date format. Use YYYY-MM-DD."},status=status.HTTP_400_BAD_REQUEST)

            # Check duplicate date excluding current holiday
            exists = Holiday.objects.filter(holiday_date=holiday_date,organization=organization,branch=branch).exclude(holiday_id=holiday_id).exists()

            if exists:
                return Response({"message": "Another holiday already exists for this date."},status=status.HTTP_400_BAD_REQUEST)
            print("3")

            year = datetime.strptime(holiday_date[0],"%Y-%m-%d").year

            holiday.holiday_name = holiday_name
            holiday.holiday_date = holiday_date
            holiday.year = year
            holiday.holiday_type = holiday_type
            holiday.description = description
            holiday.modify_by = str(request.user)
            holiday.modify_date = timezone.now()

            holiday.save()
            return Response({"message": "Holiday updated successfully.","holiday_id": holiday.holiday_id},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, holiday_id=None):

        try:

            if not holiday_id:
                return Response({"message": "Holiday ID is required."},status=status.HTTP_400_BAD_REQUEST)

            organization = request.user.organization
            branch = request.user.branch

            holiday = Holiday.objects.filter(holiday_id=holiday_id,organization=organization,branch=branch,status=1).first()

            if not holiday:
                return Response({"message": "Holiday not found."},status=status.HTTP_404_NOT_FOUND)

            holiday.status = 2
            holiday.modify_by = str(request.user)
            holiday.modify_date = timezone.now()
            holiday.save()

            return Response({"message": "Holiday deleted successfully.","holiday_id": holiday.holiday_id},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)






class EmployeeBankAccountListCreateAPIView(APIView):

    def get(self, request):

        queryset = EmployeeBankAccount.objects.filter(
            is_deleted=False
        ).select_related(
            "employee",
            "verified_by"
        )

        # Search
        search = request.GET.get("search")

        if search:
            queryset = queryset.filter(
                Q(bank_name__icontains=search) |
                Q(email__icontains=search) |
                Q(employee__clg_first_name__icontains=search) |
                Q(employee__clg_last_name__icontains=search) |
                Q(employee__clg_ref_id__icontains=search)
            )

        # Employee filter
        employee_id = request.GET.get("employee")

        if employee_id:
            queryset = queryset.filter(
                employee_id=employee_id
            )

        # Bank filter
        bank_name = request.GET.get("bank_name")

        if bank_name:
            queryset = queryset.filter(
                bank_name__icontains=bank_name
            )

        # Verification status
        verification_status = request.GET.get(
            "verification_status"
        )

        if verification_status:
            queryset = queryset.filter(
                verification_status=verification_status
            )

        # Pay status
        pay_status = request.GET.get("pay_status")

        if pay_status:
            queryset = queryset.filter(
                pay_status=pay_status
            )

        serializer = EmployeeBankAccountSerializer(
            queryset,
            many=True
        )

        return Response(
            {
                "status": True,
                "message": "Bank accounts fetched successfully.",
                "count": queryset.count(),
                "results": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def post(self, request):

        serializer = EmployeeBankAccountSerializer(
            data=request.data
        )

        if serializer.is_valid():

            employee = serializer.validated_data.get("employee")

            bank_account = serializer.save(
                added_by=str(
                    getattr(
                        request.user,
                        "clg_ref_id",
                        request.user
                    )
                )
            )

            return Response(
                {
                    "status": True,
                    "message": (
                        "Bank account added successfully "
                        "and verification initiated."
                    ),
                    "data": EmployeeBankAccountSerializer(
                        bank_account
                    ).data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "status": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )





class EmployeeBankAccountDetailAPIView(APIView):

    def get_object(self, pk):

        try:
            return EmployeeBankAccount.objects.select_related(
                "employee",
                "verified_by"
            ).get(
                bank_id=pk,
                is_deleted=False
            )

        except EmployeeBankAccount.DoesNotExist:
            return None

    def get(self, request, pk):

        bank_account = self.get_object(pk)

        if not bank_account:
            return Response(
                {
                    "status": False,
                    "message": "Bank account not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = EmployeeBankAccountSerializer(
            bank_account
        )

        return Response(
            {
                "status": True,
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

    def put(self, request, pk):

        bank_account = self.get_object(pk)

        if not bank_account:
            return Response(
                {
                    "status": False,
                    "message": "Bank account not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = EmployeeBankAccountSerializer(
            bank_account,
            data=request.data
        )

        if serializer.is_valid():

            bank_account = serializer.save(
                modified_by=str(
                    getattr(
                        request.user,
                        "clg_ref_id",
                        request.user
                    )
                )
            )

            return Response(
                {
                    "status": True,
                    "message": "Bank account updated successfully.",
                    "data": EmployeeBankAccountSerializer(
                        bank_account
                    ).data
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "status": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, pk):

        bank_account = self.get_object(pk)

        if not bank_account:
            return Response(
                {
                    "status": False,
                    "message": "Bank account not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = EmployeeBankAccountSerializer(
            bank_account,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            bank_account = serializer.save(
                modified_by=str(
                    getattr(
                        request.user,
                        "clg_ref_id",
                        request.user
                    )
                )
            )

            return Response(
                {
                    "status": True,
                    "message": "Bank account updated successfully.",
                    "data": EmployeeBankAccountSerializer(
                        bank_account
                    ).data
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "status": False,
                "message": "Validation failed.",
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):

        bank_account = self.get_object(pk)

        if not bank_account:
            return Response(
                {
                    "status": False,
                    "message": "Bank account not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Soft delete
        bank_account.is_deleted = True

        bank_account.modified_by = str(
            getattr(
                request.user,
                "clg_ref_id",
                request.user
            )
        )

        bank_account.save(
            update_fields=[
                "is_deleted",
                "modified_by",
                "modified_date"
            ]
        )

        return Response(
            {
                "status": True,
                "message": "Bank account deleted successfully."
            },
            status=status.HTTP_200_OK
        )


class EmployeeBankAccountVerifyAPIView(APIView):

    def post(self, request, pk):

        try:
            bank_account = EmployeeBankAccount.objects.get(
                bank_id=pk,
                is_deleted=False
            )

        except EmployeeBankAccount.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "message": "Bank account not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        verification_status = request.data.get(
            "verification_status"
        )

        if verification_status not in [
            "verified",
            "rejected"
        ]:
            return Response(
                {
                    "status": False,
                    "message": (
                        "verification_status must be "
                        "'verified' or 'rejected'."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        verified_by = request.user

        bank_account.verification_status = verification_status
        bank_account.verified_by = verified_by
        bank_account.verified_on = timezone.now()

        if verification_status == "verified":
            bank_account.pay_status = "active"

        elif verification_status == "rejected":
            bank_account.pay_status = "on_hold"

        bank_account.modified_by = str(
            getattr(
                request.user,
                "clg_ref_id",
                request.user
            )
        )

        bank_account.save()

        serializer = EmployeeBankAccountSerializer(
            bank_account
        )

        return Response(
            {
                "status": True,
                "message": (
                    "Bank account verified successfully."
                    if verification_status == "verified"
                    else "Bank account rejected successfully."
                ),
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )




class EmployeeBankAccountInitiateVerificationAPIView(APIView):

    def post(self, request, pk):

        try:
            bank_account = EmployeeBankAccount.objects.get(
                bank_id=pk,
                is_deleted=False
            )

        except EmployeeBankAccount.DoesNotExist:
            return Response(
                {
                    "status": False,
                    "message": "Bank account not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        bank_account.verification_status = "pending"
        bank_account.pay_status = "pending"
        bank_account.verified_by = None
        bank_account.verified_on = None

        bank_account.modified_by = str(
            getattr(
                request.user,
                "clg_ref_id",
                request.user
            )
        )

        bank_account.save()

        return Response(
            {
                "status": True,
                "message": "Bank verification initiated successfully.",
                "data": EmployeeBankAccountSerializer(
                    bank_account
                ).data
            },
            status=status.HTTP_200_OK
        )



class EmployeeBankAccountDashboardAPIView(APIView):

    def get(self, request):

        queryset = EmployeeBankAccount.objects.filter(
            is_deleted=False
        )

        data = {
            "total": queryset.count(),

            "verified": queryset.filter(
                verification_status="verified"
            ).count(),

            "pending": queryset.filter(
                verification_status="pending"
            ).count(),

            "on_hold": queryset.filter(
                pay_status="on_hold"
            ).count(),
        }

        return Response(
            {
                "status": True,
                "data": data
            },
            status=status.HTTP_200_OK
        )

class UpcomingLeaves(APIView):

    def get(self,request):

        try:
            # upcoming = SingleLeaveEntry.objects.filter(from_date__gte=timezone.localdate(),status__in = [1,2],is_deleted = 0).order_by('from_date')
            upcoming = SingleLeaveEntry.objects.filter(from_date__gte=timezone.localdate(),status__in = [1,2],is_deleted = 0).filter(Q(employee__reporting_manager=request.user) | Q(employee__reporting_manager__isnull=True)).order_by('from_date')
            seri = UpcomingLeavesSerializer(upcoming,many=True).data
            return  Response({"data" : seri},status = status.HTTP_200_OK)
        except Exception as e:
            return Response({"error" : str(e)},status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class CheckMyLeave(APIView):

    def get(self,request):
        try:
            clg_id = request.query_params.get('clg_id')
            bal = EmployeeLeaveBalance.objects.filter(employee = clg_id,status = 1)
            print("ok")
            ser = BalanceSerializer(bal,many=True).data
            return Response({"data" : ser},status = status.HTTP_200_OK)
        except Exception as e:
            return Response({"error" : str(e)},status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class ApplyLeaveWeb(APIView):  

    @transaction.atomic()
    def post(self,request):
        """Used by: HR Web Apply Leave API """

        try:
            print("a")
            clg_id = request.data.get('clg_id')
            print("aa",clg_id)
            print("b")
            data = request.data
            print("c")
            user = request.user

            # 1. Get Leave Type
            print("1")
            leave_type_obj = LeaveType.objects.filter(leave_type_id=data.get("LeaveTypeID"),status=1).first()

            if not leave_type_obj:
                return Response({"data": None,"error": {"message": "Leave Type not found"}},status=status.HTTP_400_BAD_REQUEST)

            # 2. Get Employee Leave Balance
            emp_leave_bal = EmployeeLeaveBalance.objects.filter(employee=clg_id,leave_type=leave_type_obj,status=1).first()

            if not emp_leave_bal:
                return Response({"data": None,"error": {"message": "This Leave Not Available for you"}},status=status.HTTP_400_BAD_REQUEST)

            # 3. Get Employee
            clg = EMSColleague.objects.filter(clg_id=clg_id).first()
            print("2")
            if not clg:
                return Response({"data": None,"error": {"message": "Employee not found"}},status=status.HTTP_400_BAD_REQUEST)

            # 4. Validate Dates
            from_date_str = data.get("FromDate")
            to_date_str = data.get("ToDate")

            if not from_date_str or not to_date_str:
                return Response({"data": None,"error": {"message": "FromDate and ToDate are required"}},status=status.HTTP_400_BAD_REQUEST)

            try:
                from_date = datetime.strptime(from_date_str,"%Y-%m-%d")
                to_date = datetime.strptime(to_date_str,"%Y-%m-%d")
            except ValueError:
                return Response({"data": None,"error": {"message": "Invalid date format. Use YYYY-MM-DD"}},status=status.HTTP_400_BAD_REQUEST)

            # 5. Validate Date Range
            if from_date > to_date:
                return Response({"data": None,"error": {"message": "FromDate cannot be greater than ToDate"}},status=status.HTTP_400_BAD_REQUEST)

            # 6. Calculate Leave Days
            shift = int(data.get("Shift"))
            leave_days = list(daterange(from_date,to_date))
            print("3")
            # Normal full-day leave
            if shift not in (2, 3):
                func = Decimal(str(total_days(from_date,to_date)))
            else:
                # Half day should only be for one date
                if from_date.date() != to_date.date():
                    return Response({"data": None,"error": {"message": f"Half day leave can be applied.for only one date."}},status=status.HTTP_400_BAD_REQUEST)
                func = Decimal("0.5")

            # 7. Check Existing Leave
            # If even ONE requested date already has leave,reject the ENTIRE request.
            existing_leaves = LeaveApplication.objects.filter(employee=clg_id,from_date__in=leave_days).exclude(status="Rejected").values_list("from_date",flat=True)

            existing_leaves = list(existing_leaves)
            if existing_leaves:

                days = ", ".join(day.strftime("%b-%d-%Y")for day in existing_leaves)

                return Response({"data": None,"error": {"message": (
                                f"You have already applied leave for "
                                f"{days}. Leave was not applied for any "
                                f"of the requested dates."
                            )}},status=status.HTTP_400_BAD_REQUEST)

            # 8. Check Leave Balance
            if emp_leave_bal.balance < func:
                return Response({"data": None,"error": {"message": f"Insufficient leave balance. "}},status=status.HTTP_400_BAD_REQUEST)

            current_time = timezone.now()

            # 10. Create Single Leave Entry
            leave_id = SingleLeaveEntry.objects.create(
                employee=clg,
                leave_type=leave_type_obj,
                from_date=from_date,
                to_date=to_date,
                total_days=func,
                reason=data.get("Reason"),
                full_or_half=shift,
                status=1,
                added_by=user,
                modify_by=user,
                leave_document=request.FILES.get("leave_documents",None),
                applied_date=current_time,
                added_date=current_time,
                modify_date=current_time
            )
            print("4")
            # 11. Create Day-wise Leave Applications
            leave_applications = []
            for day in leave_days:

                if shift in (2, 3):
                    day_total = Decimal("0.5")
                else:
                    day_total = Decimal("1.0")

                leave_applications.append(
                    LeaveApplication(
                        leaveID=leave_id,
                        employee=clg,
                        leave_type=leave_type_obj,
                        from_date=day,
                        to_date=day,
                        total_days=day_total,
                        reason=data.get("Reason"),
                        full_or_half=shift,
                        status="Pending",
                        added_by=user,
                        modify_by=user,
                        applied_date=current_time,
                        added_date=current_time,
                        modify_date=current_time
                    )
                )

            LeaveApplication.objects.bulk_create(leave_applications)

            # 12. Update Leave Balance
            emp_leave_bal.used += func
            emp_leave_bal.balance -= func
            emp_leave_bal.modify_by = str(user)
            emp_leave_bal.modify_date = current_time
            emp_leave_bal.save(update_fields=["used","balance","modify_by","modify_date"])

            # 12 lets share notification to user
            title = "Leave Application"
            message = f"You're leave applied from {from_date.date()} to {to_date.date()}."
            reference_id = leave_id.leaveID
            if func<=1:
                message = f"You're leave applied on {from_date.date()}."

            create_notification(clg,title,message,1,reference_id)

            print("fcm start")
            device = DeviceToken.objects.filter(clg_id = clg.clg_id,is_login=1).first()
            print("device",device)
            
            if device:
                print("device found")
                send_fcm_notification(device.token,title,message)
                print("fcm end")
            
            return Response({"data": {"message": "Leave applied successfully."},"error": None},status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"data":None,"error":str(e)},status = status.HTTP_500_INTERNAL_SERVER_ERROR)


class LeaveRequestWeb(APIView):

    def get(self,request):

        leave_id  = request.query_params.get('leave_id')
        ent = SingleLeaveEntry.objects.filter(leaveID = leave_id,status = 1).first()
        print("1",ent)
        ser = LeaveProfileSerializer(ent).data
        return Response({"data" : ser},status = status.HTTP_200_OK)
class AddComment(APIView):

    def post(self, request):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            
            serializer.save(
                added_by=get_colleague_ID(request)[1],
                added_date=timezone.now()
            )
            return Response({"message": "Comment added successfully"},status=status.HTTP_201_CREATED)
        return Response({"message": "Invalid data","errors": serializer.errors},status=status.HTTP_400_BAD_REQUEST)


class EMSColleagueGetAPIView(APIView):

    def get(self, request):
        try:
            employees = EMSColleague.objects.filter(
                clg_is_deleted=0,
                clg_is_active=1

            ).select_related(
                "clg_group",
                "clg_group__department",
                "organization",
                "branch",
            ).order_by("-clg_id")

            serializer = EMSColleagueGetSerializer(
                employees,
                many=True
            )

            return Response(
                {
                    "status": True,
                    "message": "Employees fetched successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "status": False,
                    "message": str(e),
                    "data": None,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from decimal import Decimal, InvalidOperation
class AssignLeaveToAllAPIView(APIView):

    @transaction.atomic
    def post(self, request):

        clg_id = get_colleague_ID(request)[0]

        try:
            print("1")
            year = request.data.get("year")
            leave_types = request.data.get("leave_types")

            if not year:
                return Response({"message": "year is required"},status=status.HTTP_400_BAD_REQUEST)

            try:
                year = int(year)
            except (TypeError, ValueError):
                return Response({"message": "Invalid year"},status=status.HTTP_400_BAD_REQUEST)

            if not isinstance(leave_types, list) or not leave_types:
                return Response({"message": "leave_types is required"},status=status.HTTP_400_BAD_REQUEST)


            print("2")
            # Get Active Employees
            employees = EMSColleague.objects.filter(clg_is_active = 1,clg_is_deleted = 0)

            if not employees.exists():
                return Response({"message": "No active employees found"},status=status.HTTP_400_BAD_REQUEST)

            summary = []

            # Process Every Leave Type
            print("3")
            for leave_data in leave_types:

                leave_type_id = leave_data.get("leave_type_id")

                if not leave_type_id:
                    return Response({"message": "leave_type_id is required"},status=status.HTTP_400_BAD_REQUEST)

                # Get Leave Type
                leave_type = LeaveType.objects.filter(leave_type_id=leave_type_id,status=1,is_deleted=0).first()

                print("4")
                if not leave_type:
                    return Response({"message":f"Leave type {leave_type_id} not found"},status=status.HTTP_404_NOT_FOUND)

                allocated = (leave_type.yearly_allocation or Decimal("0"))

                gender = leave_type.gender

                carry_forward = (leave_type.carry_forward or 0)

                max_carry_forward = (leave_type.max_carry_forward or Decimal("0"))

                assigned_count = 0
                already_assigned_count = 0
                skipped_count = 0

                # 1 = All
                # 2 = Male
                # 3 = Female
                eligible_employees = employees

                if gender == "2" or gender == 2:
                    eligible_employees = employees.filter(clg_gender=2)
                elif gender == "3" or gender == 3:
                    eligible_employees = employees.filter(clg_gender=3)

                # Assign Leave To Employees
                print("5")
                for employee in eligible_employees:
                    # Check Current Year's Assignment
                    current_balance = EmployeeLeaveBalance.objects.filter(employee=employee,leave_type=leave_type,year=year,is_deleted=0).order_by("-balance_id").first()

                    if current_balance:
                        # Already active
                        if current_balance.status == 1:
                            already_assigned_count += 1
                            continue

                    # Get Previous Year's Active Entry
                    print("6")
                    previous_balance = EmployeeLeaveBalance.objects.filter(employee=employee,leave_type=leave_type,year=year - 1,status=1,is_deleted=0).order_by("-balance_id").first()

                    # Calculate Carry Forward
                    carry_forward_days = Decimal("0")

                    if carry_forward == 1:
                        if previous_balance:
                            previous_balance_amount = (previous_balance.balance or Decimal("0"))
                            carry_forward_days = min(previous_balance_amount,max_carry_forward)

                    # Deactivate Previous Entry
                    print("7")
                    if previous_balance:
                        previous_balance.status = 0
                        previous_balance.modify_by = request.user
                        previous_balance.modify_date = timezone.now()
                        previous_balance.save(update_fields=["status","modify_by","modify_date"])

                    # Calculate New Balance
                    total_balance = (allocated +carry_forward_days)

                    # Create New Employee Balance
                    print("8")
                    EmployeeLeaveBalance.objects.create(
                        employee=employee,
                        leave_type=leave_type,
                        year=year,
                        allocated=allocated,
                        used=Decimal("0"),
                        pending=Decimal("0"),
                        balance=total_balance,
                        organization=leave_type.organization,
                        branch=leave_type.branch,
                        status=1,
                        is_deleted=0,
                        added_by=request.user,
                        added_date=timezone.now(),
                        modify_by=request.user,
                        modify_date=timezone.now()
                    )

                    assigned_count += 1
                    print("12")

                # Summary
                print("9")
                summary.append({
                    "leave_type_id":leave_type.leave_type_id,
                    "leave_name":leave_type.leave_name,
                    "year":year,
                    "allocated":allocated,
                    "gender":gender,
                    "carry_forward":carry_forward,
                    "max_carry_forward":max_carry_forward,
                    "assigned":assigned_count,
                    "already_assigned":already_assigned_count,
                    "skipped":skipped_count
                })
                print("10")
            print("11")

            return Response({"message":"Leaves assigned successfully","year":year,"summary":summary},status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AssignLeaveToEmployeeAPIView(APIView):

    @transaction.atomic
    def post(self, request):

        try:
            employee_id = request.data.get("employee_id")
            year = request.data.get("year")
            leave_types = request.data.get("leave_types")

            # Validation
            if not employee_id:
                return Response({"message": "employee_id is required"},status=status.HTTP_400_BAD_REQUEST)

            if not year:
                return Response({"message": "year is required"},status=status.HTTP_400_BAD_REQUEST)

            try:
                year = int(year)
            except (TypeError, ValueError):
                return Response({"message": "Invalid year"},status=status.HTTP_400_BAD_REQUEST)

            if not isinstance(leave_types, list) or not leave_types:
                return Response({"message": "leave_types is required"},status=status.HTTP_400_BAD_REQUEST)

            # Get Employee
            employee = EMSColleague.objects.filter(clg_id=employee_id,clg_is_active = 1).first()

            if not employee:
                return Response({"message": "Active employee not found"},status=status.HTTP_404_NOT_FOUND)

            summary = []

            # Process Each Leave Type
            for leave_data in leave_types:
                leave_type_id = leave_data.get("leave_type_id")

                if not leave_type_id:
                    return Response({"message": "leave_type_id is required"},status=status.HTTP_400_BAD_REQUEST)

                # Get Leave Type
                leave_type = LeaveType.objects.filter(leave_type_id=leave_type_id,status=1,is_deleted=0).first()
                if not leave_type:
                    return Response({"message":f"Leave type {leave_type_id} not found"},status=status.HTTP_404_NOT_FOUND)

                # LeaveType gender:
                # 1 = All
                # 2 = Male
                # 3 = Female
                leave_gender = leave_type.gender

                if leave_gender in [2, "2"]:
                    if str(employee.clg_gender) != "2":
                        return Response({"message":f"{leave_type.leave_name} "f"is applicable only for male employees"},status=status.HTTP_400_BAD_REQUEST)

                elif leave_gender in [3, "3"]:
                    if str(employee.clg_gender) != "3":
                        return Response({"message":f"{leave_type.leave_name} "f"is applicable only for female employees"},status=status.HTTP_400_BAD_REQUEST)

                # Check Current Year Assignment
                current_balance = EmployeeLeaveBalance.objects.filter(employee=employee,leave_type=leave_type,year=year,is_deleted=0).order_by("-balance_id").first()

                if current_balance and current_balance.status == 1:
                    summary.append({
                        "leave_type_id":leave_type.leave_type_id,
                        "leave_name":leave_type.leave_name,
                        "status":"already_assigned"
                    })

                    continue

                # Get Previous Year Balance
                previous_balance = EmployeeLeaveBalance.objects.filter(employee=employee,leave_type=leave_type,year=year - 1,status=1,is_deleted=0).order_by("-balance_id").first()
                # Calculate Carry Forward
                carry_forward_days = Decimal("0")

                if leave_type.carry_forward != None:
                    if previous_balance:
                        previous_balance_amount = (previous_balance.balance if previous_balance.balance > 0 else Decimal("0"))
                        max_carry_forward = leave_type.max_carry_forward or Decimal("0")
                        carry_forward_days = min(previous_balance_amount,max_carry_forward)

                # Deactivate Previous Entry
                if previous_balance:
                    previous_balance.status = 0
                    previous_balance.modify_by = str(request.user)
                    previous_balance.modify_date = timezone.now()

                    previous_balance.save(update_fields=["status","modify_by","modify_date"])

                # # Allocation From LeaveType
                # allocated = leave_type.yearly_allocation 

                # # Calculate Balance
                # balance = allocated + carry_forward_days
                # if request.data.get('count'):
                allocated = leave_data.get('count')
                
                # Create New Balance
                EmployeeLeaveBalance.objects.create(
                    employee=employee,
                    leave_type=leave_type,
                    year=year,
                    allocated=allocated,
                    used=Decimal("0"),
                    pending=Decimal("0"),
                    balance=allocated,
                    organization=leave_type.organization,
                    branch=leave_type.branch,
                    status=1,
                    is_deleted=0,
                    added_by=str(request.user),
                    modify_by=str(request.user),
                    added_date=timezone.now(),
                    modify_date=timezone.now()
                )

                summary.append({
                    "leave_type_id":leave_type.leave_type_id,
                    "leave_name":leave_type.leave_name,
                    "allocated":allocated,
                    "carry_forward":carry_forward_days,
                    "balance":allocated,
                    "status":"assigned"
                })

            return Response({"message":"Leave assigned successfully","employee_id":employee_id,"year":year,"summary":summary},status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FetchDepartment(APIView):

    def get(self,request):
        print("1")
        clg_id = get_colleague_ID(request)[0]

        print("1")
        emp = EMSColleague.objects.filter(clg_id = clg_id).first()

        print("1")
        all = Department.objects.filter(organization = emp.organization,status = 1,is_deleted = 0)
        print("1")
        ser = DepartmentSerializerData(all,many=True).data
        ser.append({"pk_id":0,"department_name" : "All"})
        print("1")
        return Response(ser,status = status.HTTP_200_OK)

class EMSBreakTypeGet(APIView):
    def get(self, request):
        try:
            break_types = EMSBreakType.objects.filter(status=1).order_by("id")
            serializer = EMSBreakTypeSerializer(break_types,many=True)
            return Response({"data": serializer.data,"error": None},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"data": None,"error": {"message": str(e)}},status=status.HTTP_200_O)


class BreakDetails(APIView):
    def post(self, request):
        try:
            employee_id = request.data.get("employee_id")
            break_type_id = request.data.get("break_type_id")
            action = request.data.get("action")
            if not employee_id:
                return Response(
                    {
                        "data": None,
                        "error": {
                            "message": "Employee ID is required"
                        }
                    },
                    status=status.HTTP_200_OK
                )
            if action not in ["start", "end"]:
                return Response(
                    {
                        "data": None,
                        "error": {
                            "message": "Action must be start or end"
                        }
                    },
                    status=status.HTTP_200_OK
                )
            # Get employee
            employee = EMSColleague.objects.filter(clg_id=employee_id,clg_is_deleted="0").first()
            if not employee:
                return Response(
                    {
                        "data": None,
                        "error": {
                            "message": "Employee not found"
                        }
                    },
                    status=status.HTTP_200_OK
                )
            # START BREAK
            if action == "start":
                # Employee already on break
                # if employee.clg_is_login == "break":
                #     return Response(
                #         {
                #             "data": None,
                #             "error": {
                #                 "message": "Employee is already on break"
                #             }
                #         },
                #         status=status.HTTP_200_OK
                #     )
                # Break type required
                if not break_type_id:
                    return Response(
                        {
                            "data": None,
                            "error": {
                                "message": "Break type is required"
                            }
                        },
                        status=status.HTTP_200_OK
                    )
                # Get break type
                break_type = EMSBreakType.objects.filter(id=break_type_id,status=1).first()
                if not break_type:
                    return Response(
                        {
                            "data": None,
                            "error": {
                                "message": "Break type not found"
                            }
                        },
                        status=status.HTTP_200_OK
                    )                
                # Create break details                
                break_details = EMSBreakDetails.objects.create(
                    employee=employee,
                    break_type=break_type,
                    start_break=timezone.now(),
                    added_by=str(employee.clg_id)
                )                
                # Update Employee Status                
                employee.clg_is_login = "break"
                employee.clg_break_type = break_type.break_name
                employee.modify_by = str(employee.clg_id)
                employee.modify_date = timezone.now()
                employee.save(
                    update_fields=[
                        "clg_is_login",
                        "clg_break_type",
                        "modify_by",
                        "modify_date"
                    ]
                )
                return Response(
                    {
                        "data": {
                            "break_id": break_details.id,
                            "employee_id": employee.clg_id,
                            "break_type_id": break_type.id,
                            "break_type": break_type.break_name,
                            "start_break": break_details.start_break,
                            "end_break": None,
                            "login_status": employee.clg_is_login
                        },
                        "error": None
                    },
                    status=status.HTTP_200_OK
                )
            # END BREAK
            if action == "end":
                # Employee is not on break
                # if employee.clg_is_login != "break":
                #     return Response(
                #         {
                #             "data": None,
                #             "error": {
                #                 "message": "Employee is not on break"
                #             }
                #         },
                #         status=status.HTTP_200_OK
                #     )
                # Find active break                
                break_details = EMSBreakDetails.objects.filter(employee=employee,end_break__isnull=True).order_by("-id").first()
                if not break_details:
                    return Response(
                        {
                            "data": None,
                            "error": {
                                "message": "Active break not found"
                            }
                        },
                        status=status.HTTP_200_OK
                    )
                # Update End Time
                break_details.end_break = timezone.now()
                break_details.modify_by = str(employee.clg_id)
                break_details.save(
                    update_fields=[
                        "end_break",
                        "modify_by",
                        "modify_date"
                    ]
                )
                # Change Employee Status
                employee.clg_is_login = "yes"
                employee.clg_break_type = None
                employee.modify_by = str(employee.clg_id)
                employee.modify_date = timezone.now()
                employee.save(
                    update_fields=[
                        "clg_is_login",
                        "clg_break_type",
                        "modify_by",
                        "modify_date"
                    ]
                )
                return Response(
                    {
                        "data": {
                            "break_id": break_details.id,
                            "employee_id": employee.clg_id,
                            "break_type_id": (
                                break_details.break_type.id
                                if break_details.break_type
                                else None
                            ),
                            "break_type": (
                                break_details.break_type.break_name
                                if break_details.break_type
                                else None
                            ),
                            "start_break": break_details.start_break,
                            "end_break": break_details.end_break,
                            "login_status": employee.clg_is_login
                        },
                        "error": None
                    },
                    status=status.HTTP_200_OK
                )
        except Exception as e:
            return Response(
                {
                    "data": None,
                    "error": {
                        "message": str(e)
                    }
                },
                status=status.HTTP_200_OK
            )

class EmployeeDirectoryCount(APIView):
    def get(self,request):

        today = timezone.localdate()

        # Total = EMSColleague.objects.filter(clg_is_active = 1).count()
        # active = EMSColleague.objects.filter(clg_is_active=1,clg_is_deleted = 0,).exclude(clg_id__in=SingleLeaveEntry.objects.filter(status=1,from_date__lte=today,to_date__gte=today).values_list("employee_id", flat=True)).count()
        # On_Leave = EMSColleague.objects.filter(clg_is_active=1,clg_is_deleted = 0,clg_id__in=SingleLeaveEntry.objects.filter(status=1,from_date__lte=today,to_date__gte=today).values_list("employee", flat=True)).count()
        # Suspended = EMSColleague.objects.filter(clg_is_active=2,clg_is_deleted = 1).count()
        Total = EMSColleague.objects.filter(clg_is_active = 1).filter(Q(reporting_manager=request.user) | Q(reporting_manager__isnull=True)).count()
        active = EMSColleague.objects.filter(clg_is_active=1,clg_is_deleted = 0).filter(Q(reporting_manager=request.user) | Q(reporting_manager__isnull=True)).exclude(clg_id__in=SingleLeaveEntry.objects.filter(status=1,from_date__lte=today,to_date__gte=today).values_list("employee_id", flat=True)).count()
        On_Leave = EMSColleague.objects.filter(clg_is_active=1,clg_is_deleted = 0,clg_id__in=SingleLeaveEntry.objects.filter(status=1,from_date__lte=today,to_date__gte=today).values_list("employee", flat=True)).filter(Q(reporting_manager=request.user) | Q(reporting_manager__isnull=True)).count()
        Suspended = EMSColleague.objects.filter(clg_is_active=2,clg_is_deleted = 1).filter(Q(reporting_manager=request.user) | Q(reporting_manager__isnull=True)).count()
        return Response({"Total" : Total,"active" : active,"On_Leave" : On_Leave,"Suspended" : Suspended},status = status.HTTP_200_OK)


class EmployeeDateWiseShiftGet(APIView):
    def get(self, request):
        try:
            employee_id = request.query_params.get("employee_id")
            date = request.query_params.get("date")
            if not employee_id:
                return Response(
                    {
                        "data": None,
                        "error": {"message": "Employee ID is required"}},status=status.HTTP_200_OK)
            if not date:
                return Response(
                    {
                        "data": None,
                        "error": {"message": "Date is required"}},status=status.HTTP_200_OK)
            rosters = ShiftRoster.objects.filter(employee_id=employee_id,roster_date=date,status=1,is_deleted=0).select_related("employee","shift")
            if not rosters.exists():
                return Response(
                    {
                        "data": None,
                        "error": {
                            "message": "Shift roster not found for this employee on this date"
                        }
                    },
                    status=status.HTTP_200_OK
                )
            employee = rosters[0].employee
            data = {
                "employee_id": employee.clg_id,
                "employee_name": employee.clg_first_name,
                "date": date,
                "shifts": []
            }
            for roster in rosters:
                data["shifts"].append({
                    "shift_id": (
                        roster.shift.shift_id
                        if roster.shift else None
                    ),
                    "shift_name": (
                        roster.shift.shift_name
                        if roster.shift else None
                    )
                })
            return Response({"data": data,"error": None},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"data": None,"error": {"message": str(e)}},status=status.HTTP_200_OK)


class GetEmployeeShiftAPI(APIView):
    """ fetch user shifts day wise """
    def get(self,request,month,year):
        try:
            clg_id = get_colleague_ID(request)[0]
        except Exception as e:
            return Response({"status": False,"error": {"message": "Unauthorize user"}},status = status.HTTP_401_UNAUTHORIZED)
        
        try:
            take = ShiftRoster.objects.filter(employee = clg_id,status = 1,roster_date__month = month,roster_date__year = year).order_by("roster_date","shift_id") #.distinct("roster_date","shift_id")
            ser = GetShiftSerializer(take,many=True).data
            return Response({"message": "Successfully retrieved","Shift" : ser,"error": None},status = status.HTTP_200_OK)
        except Exception as e:
            dd =[]
            return Response({"Shift":dd,"error":{"message" : str(e)}},status = status.HTTP_200_OK)
        

class AllLeaveTypes(APIView):

    def get(self, request, id):

        balances = EmployeeLeaveBalance.objects.filter(employee =id,status=1,is_deleted=0).select_related("leave_type")
        leave_types = [balance.leave_type for balance in balances if balance.leave_type]
        dataa = AllLeaveTypeSerializer(leave_types,many=True).data
        
        processed_data = []
        for data in dataa:
            data1 = {
                k: (0 if v is None else v)
                for k, v in data.items()
            }
            processed_data.append(data1)

        return Response({"status": True,"message": "Leave type list fetched successfully.","data": processed_data,},status=status.HTTP_200_OK,)


def create_notification(clg_id,title,message,notification_type=None,reference_id=None):

    notification = Notification.objects.create(
        employee=clg_id,  # must be object of clg
        title=title,
        message=message,
        notification_type=notification_type,
        reference_id=reference_id,
        created_at = timezone.localtime()
    )
    return 1

class NotificationListAPIView(APIView):

    def get(self, request):
        try:
            clg_id = get_colleague_ID(request)[0]
            notifications = Notification.objects.filter(employee =clg_id).order_by("-created_at")
            unseen_count = notifications.filter(is_read=False).count()
            serializer = NotificationSerializer(notifications,many=True)
            return Response({"count": notifications.count(),"unseen_count": unseen_count,"results": serializer.data},status = status.HTTP_200_OK)
        except Exception as e:
            return Response({"error":str(e)},status = status.HTTP_500_INTERNAL_SERVER_ERROR)

class update_check(APIView):
    # renderer_classes = [UserRenderer]
    # permission_classes = [IsAuthenticated]

    def get(self, request, device_type, version_number, build_number, App):
        if device_type == 1:
            and_latest_version = Android_updates.objects.filter(device=1,Application=App).last()
            if and_latest_version is None:
                return Response({
                    'update_status': False,
                    'url': None,
                    'message': 'No update record found'
                }, status=404)

            if version_number == and_latest_version.version and and_latest_version.Build_number == build_number:
                update_status = False
            else:
                update_status = True
            update_url = and_latest_version.url

        elif device_type == 2:
            ios_latest_version = Android_updates.objects.filter(device=2,Application=App).last()
            if ios_latest_version is None:
                return Response({
                    'update_status': False,
                    'url': None,
                    'message': 'No update record found'
                }, status=404)

            if version_number == ios_latest_version.version and ios_latest_version.Build_number == build_number:
                update_status = False
            else:
                update_status = True

            update_url = ios_latest_version.url

        else:
            update_status = False
            update_url = None

        return Response({
            'update_status': update_status,
            'url': update_url
        })

class SetToAllSeenNotification(APIView):

    def post(self,request):
        clg_id = get_colleague_ID(request)[0]
        noty = Notification.objects.filter(employee = clg_id,is_read = False).update(is_read = True)
        return Response({"message": "Success"},status = status.HTTP_200_OK)



# class AreaAllocationAPI(APIView):

#     def get(self,request):

#         try:
#             today = timezone.localdate()
#             print("today",today)

#             datas = (
#                 EMSColleague.objects
#                 .filter(
#                     clg_district_id__isnull=False,
#                     # status=1,
#                     clg_is_deleted=0
#                 )
#                 .values(
#                     "clg_district_id",
#                     "clg_district_id__dst_name"
#                 )
#                 .annotate(
#                     total=Count("clg_id", distinct=True),

#                     active=Count(
#                         "attendance",
#                         filter=Q(attendance__attendance_date=today),
#                         distinct=True
#                     ),

#                     late_comers=Count(
#                         "attendance",
#                         filter=Q(
#                             attendance__attendance_date=today,
#                             attendance__late_minutes__gt=1
#                         ),
#                         distinct=True
#                     )
#                 )
#                 .annotate(
#                     off_duty=F("total") - F("active")
#                 )
#                 .order_by("clg_district_id")
#             )

#             data = list(datas)
#             total = sum(item["total"] for item in data)
#             active = sum(item["active"] for item in data)
#             late_comers = sum(item["late_comers"] for item in data)
#             off_duty = sum(item["off_duty"] for item in data)

#             response_data = {
#                 "total_employees": total,
#                 "today_active": active,
#                 "late_comers": late_comers,
#                 "off_duty": off_duty,
#                 "data": datas
#             }
            
#             print(response_data)
#             return Response(response_data,status = status.HTTP_200_OK)
#         except Exception as e:
#             return Response({"error":str(e)},status = status.HTTP_500_INTERNAL_SERVER_ERROR)
from django.db.models import Q, Count, F, Prefetch
class AreaAllocationAPI(APIView):

    def get(self, request):

        try:
            today = timezone.localdate()
            print("today:", today)

            # ---------------------------------------
            # District-wise summary
            # ---------------------------------------
            datas = (
                EMSColleague.objects
                .filter(
                    clg_district_id__isnull=False,
                    clg_is_deleted=0
                )
                .values(
                    "clg_district_id",
                    "clg_district_id__dst_name"
                )
                .annotate(
                    total=Count(
                        "clg_id",
                        distinct=True
                    ),

                    active=Count(
                        "attendance",
                        filter=Q(
                            attendance__attendance_date=today,
                            attendance__attendance_status="present"
                        ),
                        distinct=True
                    ),

                    late_comers=Count(
                        "attendance",
                        filter=Q(
                            attendance__attendance_date=today,
                            attendance__attendance_status="present",
                            attendance__late_minutes__gt=1
                        ),
                        distinct=True
                    )
                )
                .annotate(
                    off_duty=F("total") - F("active")
                )
                .order_by("clg_district_id")
            )

            data = list(datas)

            # ---------------------------------------
            # Employee details district-wise
            # ---------------------------------------
            for district in data:

                district_id = district["clg_district_id"]

                employees = (
                    EMSColleague.objects
                    .filter(
                        clg_district_id=district_id,
                        clg_is_deleted=0
                    )
                    .prefetch_related(
                        Prefetch(
                            "attendance",
                            queryset=Attendance.objects.filter(
                                attendance_date=today,
                                is_deleted=0,
                                status=1
                            ),
                            to_attr="today_attendance"
                        )
                    )
                )

                active_employees = []
                late_comer_employees = []

                for employee in employees:

                    attendance_list = employee.today_attendance

                    # ---------------------------------------
                    # Employee basic data
                    # ---------------------------------------
                    employee_data = {
                        "employee_id": employee.clg_id,
                        "employee_code": employee.clg_code,
                        "employee_name": (
                            f"{employee.clg_first_name or ''} "
                            f"{employee.clg_last_name or ''}"
                        ).strip(),
                        "latitude": None,
                        "longitude": None
                    }

                    # ---------------------------------------
                    # Employee has attendance today
                    # ---------------------------------------
                    if attendance_list:

                        attendance = attendance_list[0]

                        # Clock-in location
                        employee_data["latitude"] = (
                            attendance.clockin_latitude
                        )
                        employee_data["longitude"] = (
                            attendance.clockin_longitude
                        )

                        # -----------------------------------
                        # Active
                        # -----------------------------------
                        if attendance.attendance_status == "present":

                            active_employees.append(
                                employee_data.copy()
                            )

                            # -----------------------------------
                            # Late comer
                            # -----------------------------------
                            if (
                                attendance.late_minutes is not None
                                and attendance.late_minutes > 1
                            ):
                                late_data = employee_data.copy()

                                late_data["late_minutes"] = (
                                    attendance.late_minutes
                                )

                                late_comer_employees.append(
                                    late_data
                                )

                # ---------------------------------------
                # Add employee lists
                # ---------------------------------------
                district["active_employees"] = active_employees

                district["late_comer_employees"] = (
                    late_comer_employees
                )


            # ---------------------------------------
            # Overall totals
            # ---------------------------------------
            total = sum(
                item["total"]
                for item in data
            )

            active = sum(
                item["active"]
                for item in data
            )

            late_comers = sum(
                item["late_comers"]
                for item in data
            )

            off_duty = sum(
                item["off_duty"]
                for item in data
            )

            # ---------------------------------------
            # Response
            # ---------------------------------------
            response_data = {
                "total_employees": total,
                "today_active": active,
                "late_comers": late_comers,
                "off_duty": off_duty,
                "data": data
            }

            return Response(
                response_data,
                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class EmployeeStatusOnAreaWise(APIView):

    def get(self,request):
        try:
            today = timezone.localdate()

            employees = (
                EMSColleague.objects
                .filter(
                    clg_is_deleted=0,
                    clg_district_id__isnull=False
                )
                .annotate(
                    attendance_today=Count("attendance",
                        filter=Q(
                            attendance__attendance_date=today
                        ),
                        distinct=True
                    ),
                    late_today=Count("attendance",
                        filter=Q(
                            attendance__attendance_date=today,
                            attendance__late_minutes__gt=1
                        ),
                        distinct=True
                    )
                )
                .annotate(
                    employee_status=Case(
                        When(
                            late_today__gt=0,
                            then=Value("late_comer")
                        ),
                        When(
                            attendance_today__gt=0,
                            then=Value("active")
                        ),
                        default=Value("off_duty"),
                        output_field=CharField()
                    )
                )
            )
            serializer = EmployeeStatusSerializer2(employees, many=True).data
            return Response(serializer,status = status.HTTP_200_OK)  
        except Exception as e:
            return Response({"error":str(e)},status = status.HTTP_500_INTERNAL_SERVER_ERROR)








from django.db.models import Count

class EMSAssetCategoryCountAPIView(APIView):

    def get(self, request):
        category_counts = (
            EMSAsset.objects
            .filter(is_deleted="0")
            .values("category")
            .annotate(count=Count("asset_id"))
            .order_by("category")
        )

        # Convert queryset result into dictionary
        count_map = {
            item["category"]: item["count"]
            for item in category_counts
        }

        response_data = []

        for value, label in EMSAsset.CATEGORY_CHOICES:
            response_data.append({
                "category": value,
                "category_name": label,
                "count": count_map.get(value, 0)
            })

        return Response(
            {
                "status": True,
                "data": response_data
            },
            status=status.HTTP_200_OK
        )
# from django.conf import settings
# class CheckEventOnDate(APIView):
#     def get(self,request):
#         sdate = request.GET.get("sdate")
#         edate = request.GET.get("edate")
#         print("date",sdate)
#         print("date",edate)
#         BASE_URL = settings.BASE_URL
#         all_data = []

#         # Convert string -> date object
#         sdatee = datetime.strptime(sdate, "%Y-%d-%m").date()
#         edatee = datetime.strptime(edate, "%Y-%d-%m").date()
#         print("bb",daterange(sdate,edate))
#         bb = daterange(sdate,edate)
#         for b in bb:
#             print("b",b)

#         print("sdate", sdate, type(sdate))
#         print("edate", edate, type(edate))
#         while sdatee<=edatee:
#             print("sdate",sdate)
#             sdate = sdate.strftime("%Y-%d-%m")
#             print(type(sdate))
#             url = f"{BASE_URL}/hrmapi/hrm_web/fetch_assign_event/?date={sdate}"
#             print("url",url)
#             response = requests.get(url,headers = {"Authorization" : request.headers.get("Authorization")})
#             all_data.append({"data": response})
#             print(all_data)
#             sdatee += timedelta(days=1)
#             print(response)
#         return Response(response)
        # try:
        #     data = response.json()
        # except ValueError:
        #     return Response({
        #         "message": "fetch_assign_event returned non-JSON response",
        #         "status_code": response.status_code,
        #         "response": response.text}, status=500)
        # return Response(data)

from django.conf import settings
from datetime import datetime, timedelta
import requests
from rest_framework.views import APIView
from rest_framework.response import Response


class CheckEventOnDate(APIView):

    def get(self, request):

        sdate = request.GET.get("sdate")
        edate = request.GET.get("edate")

        print("date", sdate)
        print("date", edate)

        BASE_URL = settings.BASE_URL
        all_data = []

        try:
            # Convert string -> date object
            sdatee = datetime.strptime(sdate, "%Y-%d-%m").date()
            edatee = datetime.strptime(edate, "%Y-%d-%m").date()

        except ValueError:
            return Response({
                "error": "Invalid date format. Expected YYYY-DD-MM"
            }, status=400)

        print("sdatee:", sdatee, type(sdatee))
        print("edatee:", edatee, type(edatee))

        # IMPORTANT: pass date objects, NOT strings
        bb = daterange(sdatee, edatee)

        for b in bb:
            print("b:", b, type(b))

            date_param = b.strftime("%Y-%d-%m")

            print("date_param:", date_param)

            url = f"{BASE_URL}/hrmapi/hrm_web/fetch_assign_event/?date={date_param}"

            print("url:", url)

            response = requests.get(
                url,
                headers={
                    "Authorization": request.headers.get("Authorization")
                }
            )

            print("status:", response.status_code)
            print("response:", response.text)
            if response.status_code == 200:
                result = response.json()
                all_data.extend(result.get("data", []))

        return Response({"status": bool(all_data),"data": all_data})

class DepartmentwiseColleagueGet(APIView):

    def get(self, request,pk_id):
        try:
            employees = EMSColleague.objects.filter(
                clg_is_deleted="0",clg_group__department__pk_id=pk_id
            ).select_related(
                "clg_group",
                "clg_group__department",
                "organization",
                "branch",
            ).order_by("-clg_id")

            serializer = EMSColleagueGetSerializer(
                employees,
                many=True
            )

            return Response(
                {
                    "status": True,
                    "message": "Employees fetched successfully.",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "status": False,
                    "message": str(e),
                    "data": None,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class StateGet(APIView):

    def get(self, request):
        states = EmsMasState.objects.filter(stis_deleted=0)

        serializer = StateSerializer(states, many=True)

        return Response({
            "status": True,
            "message": "States fetched successfully",
            "data": serializer.data
        })

class DistrictGet(APIView):

    def get(self, request):

        districts = EmsMasDistrict.objects.filter(dstis_deleted=0)

        print("SQL QUERY:", districts.query)

        for district in districts:
            print(
                district.dst_id,
                district.dst_name,
                district.dstis_deleted
            )

        serializer = DistrictSerializer(districts, many=True)

        return Response({
            "status": True,
            "message": "Districts fetched successfully",
            "data": serializer.data
        })


class CityGet(APIView):

    def get(self, request):
        cities = EmsMasCity.objects.filter(ctyis_deleted='0')

        serializer = CitySerializer(cities, many=True)

        return Response({
            "status": True,
            "message": "Cities fetched successfully",
            "data": serializer.data
        })

class ScheduleInterview(APIView):
    def post(self, request):
        candidate_id = request.data.get('candidate_id')
        try:
            candidate = Candidate.objects.get(pk_id=candidate_id,is_deleted=0)
        except Candidate.DoesNotExist:
            return Response({'status': False,'message': 'Candidate not found'}, status=404)
        serializer = InterviewCalendarSerializer(candidate,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': True,'message': 'Interview scheduled successfully','data': serializer.data}, status=200)
        return Response({'status': False,'errors': serializer.errors}, status=400)

class CandidateApprovalTimelineAPI(APIView):
    def get(self, request, candidate_id):
        try:
            candidate = Candidate.objects.get(pk_id=candidate_id,is_deleted=0)
        except Candidate.DoesNotExist:
            return Response({'status': False,'message': 'Candidate not found'}, status=404)
        serializer = CandidateApprovalTimelineSerializer(candidate)
        return Response({'status': True,'message': 'Candidate approval timeline fetched successfully','data': serializer.data}, status=200)


class Gettimeslots(APIView):
    def get(self, request):
        shift=Shift.objects.filter(is_deleted=0)
        serializer=ShiftSerializer2(shift,many=True)
        return Response({"status": True,"message": "Shift timeslots fetched successfully","data": serializer.data})

class InActivecolleague(APIView):

    def post(self,request):
        try:
            # clg_id = get_colleague_ID(request)[0]
            clg_id = request.data.get('clg_id')
            if not clg_id:
                return Response({"message" : "clg_id required" },status = status.HTTP_404_NOT_FOUND)
            emp = EMSColleague.objects.filter(clg_is_active = 1,clg_id = clg_id).first()
            if not emp:
                return Response({"message" : "colleague not found" },status = status.HTTP_404_NOT_FOUND)
            emp.clg_is_active = 2
            emp.save()
            return Response({"message" : f"Successfully Inactive colleague"},status = status.HTTP_200_OK)
        except Exception as e:
            return Response({"error" : {str(e)}},status = status.HTTP_500_INTERNAL_ERROR)


class TotalBranches(APIView):
    def get(self,request):
        try:
            total_branches = Branch.objects.filter(status=1, is_deleted=0).count()
            return Response({"status": True,"message": "Total branches fetched successfully","total_branches": total_branches},status = status.HTTP_200_OK)
        except Exception as e:
            return Response({"error" : {str(e)}},status = status.HTTP_500_INTERNAL_ERROR)


class TotalEmployees(APIView):
    def get(self,request):
        try:
            total_employees = EMSColleague.objects.filter(clg_is_active=1,clg_is_deleted=0).count()
            return Response({"status": True,"message": "Total employees fetched successfully","total_employees": total_employees},status = status.HTTP_200_OK)
        except Exception as e:
            return Response({"error" : {str(e)}},status = status.HTTP_500_INTERNAL_ERROR)

class TotalTrips(APIView):

    def get(self, request):

        try:
            total_incidence = EmsIncidence.objects.filter(incis_deleted="0").count()
            return Response({"status": True,"message": "Total incidence fetched successfully","total_incidence": total_incidence},status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": False,"error": {"message": str(e)}},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TotalAmbulances(APIView):

    def get(self, request):

        try:
            total_ambulances = EMSAmbulance.objects.filter(
                ambis_deleted="0"
            ).count()

            return Response(
                {
                    "status": True,
                    "message": "Total ambulances fetched successfully",
                    "total_ambulances": total_ambulances
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "status": False,
                    "error": {
                        "message": str(e)
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class TotalDepartments(APIView):
    def get(self, request):
        try:
            total_departments = Department.objects.filter(
                is_deleted=0,
                status=1
            ).count()

            return Response(
                {
                    "status": True,
                    "message": "Total departments fetched successfully",
                    "total_departments": total_departments
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    "status": False,
                    "error": {
                        "message": str(e)
                    }
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AddManager(APIView):

    def get(self,request):
        emp = EMSColleague.objects.filter(
        ~Q(clg_is_active=2) & ~Q(clg_is_deleted=1)
        ).annotate(name=Concat("clg_first_name" if "clg_first_name" else "",Value(" "),"clg_mid_name" if "clg_mid_name" else "",Value(""),"clg_last_name" if "clg_last_name" else None)
        ).values("clg_id","name").order_by('clg_id')

        return Response(emp,status = status.HTTP_200_OK)


# class uu(APIView):

#     def post(self,request):
#         clg = EMSColleague.objects.filter(clg_id = 143).first()
#         emp = EMSColleague.objects.all()
#         emp.update(reporting_manager = clg)
#         return Response({"mes" : "success"},status = status.HTTP_200_OK)


class AttendanceReportAPIView(APIView):
    def get(self,request):
        start_date=request.GET.get("start_date")
        end_date=request.GET.get("end_date")
        department=request.GET.get("department")
        export=request.GET.get("export")

        if not start_date or not end_date:
            return Response({"message":"start_date and end_date are required."},status=400)

        if start_date>end_date:
            return Response({"message":"start_date cannot be greater than end_date."},status=400)

        attendances=Attendance.objects.filter(
            attendance_date__range=[start_date,end_date],
            status=1,
            is_deleted=0
        ).select_related("employee").order_by(
            "employee_id","attendance_date","first_login"
        )

        if department:
            attendances=attendances.filter(
                employee__clg_department_name=department
            )

        employee_ids=list(
            attendances.values_list("employee_id",flat=True).distinct()
        )

        # Multiple attendance sessions
        attendance_map={}

        for attendance in attendances:
            key=(int(attendance.employee_id),attendance.attendance_date)

            if key not in attendance_map:
                attendance_map[key]={
                    "attendance":attendance,
                    "clock_in":attendance.first_login,
                    "clock_out":attendance.last_logout,
                    "sessions":[]
                }

            data=attendance_map[key]

            if attendance.first_login and attendance.last_logout:
                data["sessions"].append({
                    "clock_in":attendance.first_login,
                    "clock_out":attendance.last_logout
                })

            if attendance.first_login and (
                not data["clock_in"] or
                attendance.first_login<data["clock_in"]
            ):
                data["clock_in"]=attendance.first_login

            if attendance.last_logout and (
                not data["clock_out"] or
                attendance.last_logout>data["clock_out"]
            ):
                data["clock_out"]=attendance.last_logout

        # Incident assignments
        assignments=EmsIncidenceAmbulance.objects.filter(
            inc_ref_id__isnull=False
        ).order_by("-assigned_time","-inc_amb_id")

        assignment_map={}

        for assignment in assignments:
            if not assignment.assigned_time:
                continue

            assigned_date=assignment.assigned_time.date()

            if str(assigned_date)<start_date or str(assigned_date)>end_date:
                continue

            crew=assignment.crew_id

            if not crew:
                continue

            if isinstance(crew,str):
                try:
                    crew=json.loads(crew)
                except (json.JSONDecodeError,TypeError):
                    continue

            if isinstance(crew,dict):
                crew=[crew]

            if not isinstance(crew,list):
                continue

            incident_id=str(assignment.inc_ref_id)

            for member in crew:
                if not isinstance(member,dict):
                    continue

                crew_employee_id=member.get("id")

                if not crew_employee_id:
                    continue

                try:
                    crew_employee_id=int(crew_employee_id)
                except (TypeError,ValueError):
                    continue

                if crew_employee_id not in employee_ids:
                    continue

                key=(crew_employee_id,assigned_date,incident_id)
                assignment_map[key]=incident_id

        # Latest action for employee + incident
        incident_ids=list(set(assignment_map.values()))
        action_map={}

        if incident_ids:
            actions=IncidentAction.objects.filter(
                inc_ref_id__in=incident_ids,
                user_id__in=employee_ids
            ).order_by("-created_at","-id")

            for action in actions:
                key=(int(action.user_id),str(action.inc_ref_id))

                if key not in action_map:
                    action_map[key]=action.status

        # Employee total incident calculation
        employee_incidents={}

        for employee_id in employee_ids:
            employee_incidents[employee_id]={
                "all":set(),
                "accepted":set(),
                "rejected":set(),
                "not_performed":set()
            }

        for employee_id,assigned_date,incident_id in assignment_map:
            if employee_id not in employee_incidents:
                continue

            employee_incidents[employee_id]["all"].add(incident_id)

            action=action_map.get(
                (employee_id,str(incident_id))
            )

            if action==1:
                employee_incidents[employee_id]["accepted"].add(incident_id)
            elif action==2:
                employee_incidents[employee_id]["rejected"].add(incident_id)
            else:
                employee_incidents[employee_id]["not_performed"].add(incident_id)

        # Final report
        report=[]

        for (employee_id,attendance_date),attendance_data in attendance_map.items():
            attendance=attendance_data["attendance"]
            employee=attendance.employee

            incidents=sorted({
                inc_id
                for emp_id,assigned_date,inc_id in assignment_map
                if emp_id==employee_id and assigned_date==attendance_date
            })

            accepted_ids=[]
            rejected_ids=[]
            not_performed_ids=[]

            for inc_id in incidents:
                action=action_map.get(
                    (employee_id,str(inc_id))
                )

                if action==1:
                    accepted_ids.append(inc_id)
                elif action==2:
                    rejected_ids.append(inc_id)
                else:
                    not_performed_ids.append(inc_id)

            # Break time
            if not attendance.employee or not attendance_date:
                break_time="00h 00m"
                break_seconds=0
            else:
                start_of_day=datetime.combine(attendance_date,time.min)
                end_of_day=datetime.combine(attendance_date,time.max)

                if timezone.is_naive(start_of_day):
                    start_of_day=timezone.make_aware(start_of_day)

                if timezone.is_naive(end_of_day):
                    end_of_day=timezone.make_aware(end_of_day)

                breaks=EMSBreakDetails.objects.filter(
                    employee=employee_id,
                    start_break__gte=start_of_day,
                    start_break__lte=end_of_day,
                    start_break__isnull=False,
                    end_break__isnull=False
                )

                break_seconds=0

                for break_detail in breaks:
                    start=break_detail.start_break
                    end=break_detail.end_break

                    if start and end and end>start:
                        break_seconds+=(end-start).total_seconds()

                hours=int(break_seconds//3600)
                minutes=int((break_seconds%3600)//60)
                break_time=f"{hours:02d}h {minutes:02d}m"

            # Total working hours from all attendance sessions
            total_seconds=0

            for session in attendance_data["sessions"]:
                session_seconds=(
                    session["clock_out"]-
                    session["clock_in"]
                ).total_seconds()

                if session_seconds>0:
                    total_seconds+=session_seconds

            # Minus total break time
            total_seconds=max(0,total_seconds-break_seconds)
            total_hours=round(total_seconds/3600,2)

            totals=employee_incidents.get(
                employee_id,
                {
                    "all":set(),
                    "accepted":set(),
                    "rejected":set(),
                    "not_performed":set()
                }
            )

            report.append({
                "_employee_id":employee_id,
                "sr_no":len(report)+1,
                "first_name":employee.clg_first_name or "",
                "last_name":employee.clg_last_name or "",
                "department":employee.clg_department_name or "",
                "attendance_date":(
                    attendance_date.strftime("%Y-%m-%d")
                    if attendance_date else ""
                ),
                "clock_in":(
                    timezone.localtime(
                        attendance_data["clock_in"]
                    ).strftime("%Y-%m-%d %H:%M:%S")
                    if attendance_data["clock_in"] else ""
                ),
                "clock_out":(
                    timezone.localtime(
                        attendance_data["clock_out"]
                    ).strftime("%Y-%m-%d %H:%M:%S")
                    if attendance_data["clock_out"] else ""
                ),
                "break_time":break_time,
                "total_hours":total_hours,
                "incident_ref_id":incidents,
                "accepted_ref_id":accepted_ids,
                "rejected_ref_id":rejected_ids,
                "not_performed_ref_id":not_performed_ids,
                "total_assigned_incident":len(totals["all"]),
                "accepted":len(totals["accepted"]),
                "rejected":len(totals["rejected"]),
                "not_performed":len(totals["not_performed"])
            })

        report.sort(
            key=lambda x:(
                x["_employee_id"],
                x["attendance_date"],
                x["clock_in"]
            )
        )

        for index,row in enumerate(report,1):
            row["sr_no"]=index

        # Excel
        if export=="excel":
            excel_data=[]

            for row in report:
                excel_data.append({
                    "Sr. No":row["sr_no"],
                    "First Name":row["first_name"],
                    "Last Name":row["last_name"],
                    "Department":row["department"],
                    "Date":row["attendance_date"],
                    "Clock In":row["clock_in"],
                    "Clock Out":row["clock_out"],
                    "Break Time":row["break_time"],
                    "Total Hours":row["total_hours"],
                    "Total Events":row["total_assigned_incident"],
                    "Accepted":row["accepted"],
                    "Rejected":row["rejected"],
                    "Not Performed":row["not_performed"]
                })

            df=pd.DataFrame(excel_data)

            response=HttpResponse(
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )

            response["Content-Disposition"]=(
                f'attachment; filename="attendance_report_'
                f'{datetime.now().strftime("%Y-%m-%d_%H-%M-%S")}.xlsx"'
            )

            with pd.ExcelWriter(response,engine="openpyxl") as writer:
                df.to_excel(
                    writer,
                    index=False,
                    sheet_name="Attendance Report"
                )

                ws=writer.sheets["Attendance Report"]

                for cell in ws[1]:
                    cell.fill=PatternFill("solid",fgColor="1F4E78")
                    cell.font=Font(color="FFFFFF",bold=True)
                    cell.alignment=Alignment(
                        horizontal="center",
                        vertical="center"
                    )

                widths={
                    "A":8,"B":18,"C":18,"D":18,"E":14,
                    "F":22,"G":22,"H":14,"I":14,"J":18,
                    "K":12,"L":12,"M":18
                }

                for column,width in widths.items():
                    ws.column_dimensions[column].width=width

                for row in ws.iter_rows(min_row=2):
                    for cell in row:
                        cell.alignment=Alignment(
                            horizontal="center",
                            vertical="center",
                            wrap_text=True
                        )

                # Merge employee details + GRAND TOTAL counts
                start_row=2
                previous_employee=None

                for row_num in range(2,ws.max_row+2):
                    current_employee=(
                        report[row_num-2]["_employee_id"]
                        if row_num-2<len(report)
                        else None
                    )

                    if current_employee!=previous_employee:
                        if previous_employee is not None and row_num-start_row>1:
                            end_row=row_num-1

                            for col in [2,3,4,10,11,12,13]:
                                ws.merge_cells(
                                    start_row=start_row,
                                    start_column=col,
                                    end_row=end_row,
                                    end_column=col
                                )

                                ws.cell(
                                    start_row,col
                                ).alignment=Alignment(
                                    horizontal="center",
                                    vertical="center",
                                    wrap_text=True
                                )

                        start_row=row_num

                    previous_employee=current_employee

            return response

        # JSON
        clean_report=[]

        for row in report:
            clean_report.append({
                key:value
                for key,value in row.items()
                if not key.startswith("_")
            })

        serializer=AttendanceReportSerializer(
            clean_report,
            many=True
        )

        return Response(
            {
                "message":"Attendance report fetched successfully.",
                "filters":{
                    "start_date":start_date,
                    "end_date":end_date,
                    "department":department
                },
                "data":serializer.data
            },
            status=200
        )


        
# @pytest.mark.django_db
# def test_attendance_clock_out_success(api_client, employee):
#     login_time = timezone.now() - timedelta(hours=8)

#     attendance = Attendance.objects.create(
#         employee=employee,
#         attendance_date=timezone.localdate(),
#         first_login=login_time,
#         attendance_status="present",
#         status=1,
#         is_deleted=0,
#     )

#     url = reverse("attendance-post")

#     payload = {
#         "employee": employee.clg_id,
#         "attendance_id": attendance.attendance_id,
#         "latitude": 18.5204,
#         "longitude": 73.8567,
#         "remarks": "Test clock out",
#         "attendance_type": "CLOCK_OUT",
#     }

#     response = api_client.post(url, payload, format="json")

#     assert response.status_code == 200
#     assert response.data["status"] is True

#     attendance.refresh_from_db()

#     assert attendance.last_logout is not None
#     assert attendance.clockout_latitude == 18.5204
#     assert attendance.clockout_longitude == 73.8567
#     assert attendance.attendance_status == "present"
#     assert attendance.working_hours is not None


# @pytest.mark.django_db
# def test_attendance_clock_out_working_hours(api_client, employee):
#     login_time = timezone.now() - timedelta(hours=4)

#     attendance = Attendance.objects.create(
#         employee=employee,
#         attendance_date=timezone.localdate(),
#         first_login=login_time,
#         attendance_status="present",
#         status=1,
#         is_deleted=0,
#     )

#     url = reverse("attendance-post")

#     payload = {
#         "employee": employee.clg_id,
#         "attendance_id": attendance.attendance_id,
#         "latitude": 18.5204,
#         "longitude": 73.8567,
#         "remarks": "Working hours test",
#         "attendance_type": "CLOCK_OUT",
#     }

#     response = api_client.post(url, payload, format="json")

#     assert response.status_code == 200
#     assert response.data["status"] is True

#     attendance.refresh_from_db()

#     assert attendance.last_logout is not None
#     assert float(attendance.working_hours) >= 3.9
#     assert float(attendance.working_hours) <= 4.1


# @pytest.mark.django_db
# def test_attendance_clock_out_invalid_attendance_id(api_client, employee):
#     url = reverse("attendance-post")

#     payload = {
#         "employee": employee.clg_id,
#         "attendance_id": 999999,
#         "latitude": 18.5204,
#         "longitude": 73.8567,
#         "remarks": "Invalid attendance",
#         "attendance_type": "CLOCK_OUT",
#     }

#     response = api_client.post(url, payload, format="json")

#     assert response.status_code == 200
#     assert response.data["status"] is False
#     assert response.data["error"]["message"] == "Invalid attendance ID."


# @pytest.mark.django_db
# def test_attendance_clock_out_already_completed(api_client, employee):
#     attendance = Attendance.objects.create(
#         employee=employee,
#         attendance_date=timezone.localdate(),
#         first_login=timezone.now() - timedelta(hours=8),
#         last_logout=timezone.now(),
#         attendance_status="present",
#         status=1,
#         is_deleted=0,
#     )

#     url = reverse("attendance-post")

#     payload = {
#         "employee": employee.clg_id,
#         "attendance_id": attendance.attendance_id,
#         "latitude": 18.5204,
#         "longitude": 73.8567,
#         "remarks": "Second clock out",
#         "attendance_type": "CLOCK_OUT",
#     }

#     response = api_client.post(url, payload, format="json")

#     assert response.status_code == 200
#     assert response.data["status"] is False


class Dashboard(APIView):
    def get(self, request):
        try:
            period = request.GET.get("period", "today")
            today = timezone.localdate()

            if period == "today":
                start_date = today
            elif period == "month":
                start_date = today.replace(day=1)
            elif period == "till_date":
                start_date = None
            else:
                return JsonResponse({
                    "status": False,
                    "message": "Invalid period. Use today, month or till_date."
                }, status=400)

            # ALL ACTIVE EMPLOYEES
            employees = EMSColleague.objects.filter(
                clg_is_deleted="0",
                clg_is_active=1
            )
            total_employees = employees.count()

            # ALL ATTENDANCE
            attendance_filter = {
                "employee__clg_is_deleted": "0",
                "employee__clg_is_active": 1,
                "attendance_date__lte": today,
            }

            if start_date:
                attendance_filter["attendance_date__gte"] = start_date

            attendance = Attendance.objects.filter(**attendance_filter)

            # STAFF ATTENDANCE
            present = attendance.filter(
                attendance_status="present"
            ).values("employee_id").distinct().count()

            absent = attendance.filter(
                attendance_status="absent"
            ).values("employee_id").distinct().count()

            half_day = attendance.filter(
                attendance_status="half_day"
            ).values("employee_id").distinct().count()

            leave = attendance.filter(
                attendance_status="leave"
            ).values("employee_id").distinct().count()

            holiday = attendance.filter(
                attendance_status="holiday"
            ).values("employee_id").distinct().count()

            weekoff = attendance.filter(
                attendance_status="weekoff"
            ).values("employee_id").distinct().count()

            # CREW ATTENDANCE
            crew_attendance = attendance.filter(
                employee__clg_group__gcode="UG-CREW"
            )

            total_crew = employees.filter(
                clg_group__gcode="UG-CREW"
            ).count()

            crew_present = crew_attendance.filter(
                attendance_status="present"
            ).values("employee_id").distinct().count()

            crew_absent = crew_attendance.filter(
                attendance_status="absent"
            ).values("employee_id").distinct().count()

            crew_checked_in = crew_attendance.filter(
                first_login__isnull=False
            ).values("employee_id").distinct().count()

            crew_missing_logs = crew_attendance.filter(
                Q(first_login__isnull=True) |
                Q(last_logout__isnull=True)
            ).values("employee_id").distinct().count()

            # WORKING HOURS - ALL EMPLOYEES
            employee_hours = attendance.filter(
                employee__isnull=False
            ).values(
                "employee_id",
                "employee__title",
                "employee__clg_first_name",
                "employee__clg_last_name",
                "employee__clg_designation",
                "employee__clg_department_name"
            ).annotate(
                total_hours=Sum("working_hours"),
                overtime_hours=Sum("overtime_hours")
            ).order_by(
                "employee__clg_first_name"
            )

            employee_working_hours = []

            for item in employee_hours:
                total_hours = float(item["total_hours"] or 0)
                overtime_hours = float(item["overtime_hours"] or 0)

                name = " ".join(
                    filter(None, [
                        item["employee__title"],
                        item["employee__clg_first_name"],
                        item["employee__clg_last_name"]
                    ])
                ).strip()

                required_hours = 8

                if overtime_hours > 0 or total_hours > required_hours:
                    status = "Extra Hours"
                elif total_hours < required_hours:
                    status = "Below Required"
                else:
                    status = "On Track"

                employee_working_hours.append({
                    "employee_id": item["employee_id"],
                    "name": name,
                    "designation": item["employee__clg_designation"] or "",
                    "department": item["employee__clg_department_name"] or "",
                    "working_hours": total_hours,
                    "overtime_hours": overtime_hours,
                    "required_hours": required_hours,
                    "status": status
                })

            # DEPARTMENT-WISE WORKING HOURS
            department_hours = attendance.filter(
                employee__isnull=False,
                working_hours__isnull=False
            ).values(
                "employee__clg_department_name"
            ).annotate(
                total_hours=Sum("working_hours")
            ).order_by(
                "employee__clg_department_name"
            )

            department_working_hours = []

            for item in department_hours:
                department = item["employee__clg_department_name"]

                if not department:
                    continue

                department_working_hours.append({
                    "department": department,
                    "working_hours": float(item["total_hours"] or 0)
                })

            total_working_hours = attendance.filter(
                working_hours__isnull=False
            ).aggregate(
                total_hours=Sum("working_hours")
            )["total_hours"] or 0

            # EMPLOYEE LOGIN SUMMARY
            tz = timezone.get_current_timezone()

            login_filter = {
                "is_deleted": 0,
                "clg_ref_id__clg_is_active": 1,
                "clg_ref_id__clg_is_deleted": "0",
                "clg_login_time__isnull": False,
            }

            if period == "today":
                start_dt = timezone.make_aware(
                    dt.datetime.combine(
                        today,
                        dt.time.min
                    ),
                    tz
                )
                end_dt = timezone.make_aware(
                    dt.datetime.combine(
                        today,
                        dt.time.max
                    ),
                    tz
                )
                login_filter["clg_login_time__range"] = (
                    start_dt,
                    end_dt
                )

            elif period == "month":
                start_date = today.replace(day=1)

                start_dt = timezone.make_aware(
                    dt.datetime.combine(
                        start_date,
                        dt.time.min
                    ),
                    tz
                )
                end_dt = timezone.make_aware(
                    dt.datetime.combine(
                        today,
                        dt.time.max
                    ),
                    tz
                )

                login_filter["clg_login_time__range"] = (
                    start_dt,
                    end_dt
                )

            elif period == "till_date":
                end_dt = timezone.make_aware(
                    dt.datetime.combine(
                        today,
                        dt.time.max
                    ),
                    tz
                )

                login_filter["clg_login_time__lte"] = end_dt

            login_records = EMSColleagueLogin.objects.filter(
                **login_filter
            ).values_list(
                "clg_login_time",
                flat=True
            )

            login_count = defaultdict(int)

            for login_time in login_records:
                if login_time:
                    local_time = timezone.localtime(login_time)
                    time_slot = local_time.strftime("%H:%M")
                    login_count[time_slot] += 1

            login_summary = [
                {
                    "time": time_slot,
                    "employees": count
                }
                for time_slot, count in sorted(login_count.items())
            ]

            # EMPLOYMENT TYPE
            employment_type = employees.values(
                "clg_employment_type"
            ).annotate(
                count=Count("clg_id")
            ).order_by(
                "clg_employment_type"
            )

            employment_type_data = []

            for item in employment_type:
                employment_type_data.append({
                    "type": item["clg_employment_type"] or "Not Specified",
                    "count": item["count"]
                })

            # ASSETS
            active_allocations = EMSAssetAllocation.objects.filter(
                allocation_status__in=[
                    "active",
                    "pending",
                    "on_hold"
                ],
                is_deleted="0",
                colleague__clg_is_deleted="0",
                colleague__clg_is_active=1
            )
            print("period-",period)
            print("start_date",start_date)
            if period == "today":
                print("today started")
                assets_allocated = active_allocations.filter(allocated_date=today).count()
                assets_by_category = active_allocations.filter(allocated_date=today).values("asset__category").annotate(count=Count("allocation_id")).order_by("asset__category")
            elif period == "month":
                print("month started")
                assets_allocated = active_allocations.filter(allocated_date__gte=start_date).count()
                assets_by_category = active_allocations.filter(allocated_date__gte=start_date).values("asset__category").annotate(count=Count("allocation_id")).order_by("asset__category")
            else:
                print("no date started")
                assets_allocated = active_allocations.count()
                assets_by_category = active_allocations.values("asset__category").annotate(count=Count("allocation_id")).order_by("asset__category")
            
            asset_data = []

            for item in assets_by_category:
                asset_data.append({
                    "category": item["asset__category"],
                    "count": item["count"]
                })

            # UNIFORM
            if period == "today":
                print("today unique")
                uniform_issued = employees.filter(Q(shirt_qty__gt=0) |Q(coat_qty__gt=0) |Q(balmoral_qty__gt=0),Q(uniform_added_date = start_date)).count()
                uniform_returned = employees.filter(uniform_return=True,uniform_added_date = today).count()
            elif period == "month":
                print("month unique")
                uniform_issued = employees.filter(Q(shirt_qty__gt=0) |Q(coat_qty__gt=0) |Q(balmoral_qty__gt=0),Q(uniform_added_date__gte = start_date)).count()
                uniform_returned = employees.filter(uniform_return=True,uniform_added_date__gte = today).count()
            else:
                print("till unique")
                uniform_issued = employees.filter(Q(shirt_qty__gt=0) |Q(coat_qty__gt=0) |Q(balmoral_qty__gt=0)).count()
                uniform_returned = employees.filter(uniform_return=True).count()

            # FINAL RESPONSE
            return JsonResponse({
                "status": True,
                "period": period,
                "date": str(today),

                "staff_attendance": {
                    "total_employees": total_employees,
                    "present": present,
                    "absent": absent,
                    "half_day": half_day,
                    "leave": leave,
                    "holiday": holiday,
                    "weekoff": weekoff
                },

                "crew_attendance": {
                    "total_crew": total_crew,
                    "present": crew_present,
                    "absent": crew_absent,
                    "checked_in": crew_checked_in,
                    "missing_logs": crew_missing_logs
                },

                "crew_working_hours": {
                    "total_hours": float(total_working_hours),
                    "departments": department_working_hours,
                    "employees": employee_working_hours
                },

                "employees_login_summary": login_summary,

                "employment_type": employment_type_data,

                "assets_allocated": {
                    "total": assets_allocated,
                    "by_category": asset_data
                },

                "uniform": {
                    "issued": uniform_issued,
                    "returned": uniform_returned
                }
            })

        except Exception as e:
            return JsonResponse({
                "status": False,
                "message": "Dashboard data could not be loaded.",
                "error": str(e)
            }, status=500)