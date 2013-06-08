Attribute VB_Name = "Module1"


Declare Sub Sleep Lib "kernel32" (ByVal dwMilliseconds As Long)

Sub start_befunge()
Attribute start_befunge.VB_ProcData.VB_Invoke_Func = " \n14"

    Dim b As Befunge
    Set b = New Befunge
    
    'Application.ScreenUpdating = False
    
    While (b.step)
    Wend
    
    'Application.ScreenUpdating = True
    
    Worksheets("translate").Activate
    
End Sub

